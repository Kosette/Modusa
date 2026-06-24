// ==UserScript==
// @name         V2EX 贴文总结
// @namespace    v2ex.ai
// @version      2.1
// @description  为 V2EX 帖子生成总结
// @author       kosette
// @match        https://*.v2ex.com/t/*
// @match        https://v2ex.com/t/*
// @icon         https://www.v2ex.com/favicon.ico
// @grant        none
// @license      MIT
// @comment      Inspired by https://github.com/Jandaes/v2ex_ai
// ==/UserScript==

(function () {
  "use strict";

  const doc = document;
  const win = window;
  const $ = (s, p = doc) => p.querySelector(s);

  const themes = {
    dark: { bg: "#2d2d2d", t: "#e0e0e0", i: "#3d3d3d", b: "#4d4d4d" },
    light: { bg: "#fff", t: "#333", i: "#f5f5f5", b: "#ddd" },
  };

  // 主题与设置分开存储，避免类型混乱
  const store = {
    getTheme: () => localStorage.getItem("v2ex_summary_theme") || "system",
    setTheme: (v) => localStorage.setItem("v2ex_summary_theme", v),
    getSettings: () =>
      JSON.parse(localStorage.getItem("v2ex_summary_settings") || "{}"),
    setSettings: (v) =>
      localStorage.setItem("v2ex_summary_settings", JSON.stringify(v)),
  };

  const defaultPrompt =
    "只精简总结文章内容和评论的核心要点、不需要加入你的任何观点。分别输出文章内容和用户评论";

  // 简单的 Markdown 渲染（粗体、列表、换行），无需外部依赖
  function renderMarkdown(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/^#{1,3} (.+)$/gm, "<strong>$1</strong>")
      .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
      .replace(/\n/g, "<br>");
  }

  function getThemeColors() {
    const saved = store.getTheme();
    const prefersDark = win.matchMedia("(prefers-color-scheme:dark)").matches;
    const isDark = saved === "dark" || (saved === "system" && prefersDark);
    return themes[isDark ? "dark" : "light"];
  }

  function createElement(tag, props = {}) {
    const el = doc.createElement(tag);
    Object.assign(el, props);
    return el;
  }

  function addStyle(el, css) {
    const s = createElement("style");
    s.textContent = css;
    el.appendChild(s);
  }

  function modal() {
    const th = getThemeColors();
    const overlay = createElement("div", {
      style: `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.6);display:flex;justify-content:center;align-items:center;z-index:1000`,
    });
    const box = createElement("div", {
      style: `position:relative;background:${th.bg};padding:25px;border-radius:12px;width:450px;max-width:90%;color:${th.t};padding-bottom:20px`,
    });

    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid ${th.b};padding-bottom:10px">
        <h3 style="margin:0;font-size:18px">V2EX 文章总结助手设置</h3>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:14px">主题</span>
          <select id="v2s-theme" style="padding:4px 8px">
            <option value="system">跟随系统</option>
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </div>
      </div>
      <div class="v2s-form">
        <div class="v2s-group"><label>API URL：</label><input id="v2s-url" placeholder="输入API地址"></div>
        <div class="v2s-group"><label>API Key：</label><div class="v2s-pwd"><input type="password" id="v2s-key" placeholder="输入API Key"><span class="v2s-eye">🔒</span></div></div>
        <div class="v2s-group"><label>模型名称：</label><input id="v2s-model" placeholder="输入模型名称"></div>
        <div class="v2s-group"><label>系统提示词：</label><textarea id="v2s-prompt" placeholder="请输入"></textarea></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:25px">
        <div style="display:flex;gap:10px">
          <button id="v2s-cancel">取消</button>
          <button id="v2s-save" class="v2s-primary">保存</button>
        </div>
      </div>
    `;

    addStyle(
      box,
      `
      .v2s-form{display:flex;flex-direction:column;gap:15px}
      .v2s-group{display:flex;align-items:center}
      .v2s-group label{width:85px;text-align:right;margin-right:15px;flex-shrink:0}
      .v2s-group input,.v2s-group textarea{flex:1;padding:8px 12px;border:1px solid ${th.b};border-radius:6px;background:${th.i};color:${th.t}}
      .v2s-group textarea{height:100px;resize:vertical}
      .v2s-pwd{position:relative;flex:1;display:flex}
      .v2s-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);cursor:pointer;user-select:none;opacity:.7}
      button{padding:8px 16px;border:none;border-radius:6px;background:${th.i};color:${th.t};cursor:pointer}
      .v2s-primary{background:#0066cc;color:#fff}
      .v2s-github{color:${th.t};text-decoration:none;opacity:.8;display:flex;align-items:center;gap:6px;font-size:14px}
    `,
    );

    overlay.appendChild(box);
    doc.body.appendChild(overlay);

    // 加载已保存的设置
    const settings = store.getSettings();
    $("#v2s-url", box).value = settings.apiUrl || "";
    $("#v2s-key", box).value = settings.apiKey || "";
    $("#v2s-model", box).value = settings.modelName || "";
    $("#v2s-prompt", box).value = settings.prompt || defaultPrompt;
    $("#v2s-theme", box).value = store.getTheme();

    // 密码显示切换
    $(".v2s-eye", box).onclick = (e) => {
      const input = $("#v2s-key", box);
      input.type = input.type === "password" ? "text" : "password";
      e.target.textContent = input.type === "password" ? "🔒" : "🔓";
    };

    // 保存
    const saveBtn = $("#v2s-save", box);
    saveBtn.onclick = () => {
      store.setSettings({
        apiUrl: $("#v2s-url", box).value.trim(),
        apiKey: $("#v2s-key", box).value.trim(),
        modelName: $("#v2s-model", box).value.trim(),
        prompt: $("#v2s-prompt", box).value.trim(),
      });
      store.setTheme($("#v2s-theme", box).value);
      saveBtn.textContent = "✓ 已保存";
      setTimeout(() => overlay.remove(), 600);
    };

    $("#v2s-cancel", box).onclick = () => overlay.remove();
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };
  }

  function summary() {
    const header = $(".header");
    if (!header) return;
    const gray = $(".gray", header);
    if (!gray || $(".summary-button", gray)) return;

    gray.insertAdjacentText("beforeend", " ∙ ");

    const sumBtn = createElement("a", {
      href: "javascript:void(0)",
      className: "tb summary-button",
      innerHTML: '总结 <span style="font-size:14px">✨</span>',
    });

    sumBtn.onclick = async () => {
      if (sumBtn.dataset.loading === "1") return; // 防抖：请求中禁止重复触发

      const content = $(".topic_content")?.textContent.trim();
      if (!content) return;

      const container = getContainer();
      if (!container) return;

      const cont = $(".summary-content", container);

      // 已有缓存内容且非错误状态，直接展示
      if (
        container.style.display === "none" &&
        cont.innerHTML &&
        !cont.dataset.error
      ) {
        container.style.display = "block";
        return;
      }

      await runSummary(sumBtn, container, cont, content);
    };

    gray.appendChild(sumBtn);
    gray.insertAdjacentText("beforeend", " ∙ ");

    const setBtn = createElement("a", {
      href: "javascript:void(0)",
      className: "tb settings-button",
      innerHTML: '设置 <span style="font-size:14px">⚙️</span>',
    });
    setBtn.onclick = modal;
    gray.appendChild(setBtn);
  }

  async function runSummary(btn, container, cont, articleContent) {
    btn.dataset.loading = "1";
    cont.dataset.error = "";
    container.style.display = "block";

    // 抓取评论（带分页进度）
    cont.textContent = "正在获取评论...";
    const comments = await getAllComments((cur, total) => {
      cont.textContent =
        total > 1
          ? `正在获取评论（第 ${cur}/${total} 页）...`
          : "正在获取评论...";
    });

    const fullContent = `文章内容：\n${articleContent}\n\n评论内容：\n${comments.join(" ")}`;

    cont.textContent = "正在生成总结...";
    const result = await request(fullContent);

    if (result) {
      cont.innerHTML = renderMarkdown(result);
    } else {
      cont.textContent = "生成总结失败，请检查设置和网络连接";
      cont.dataset.error = "1";
    }

    btn.dataset.loading = "";
  }

  async function getAllComments(onProgress) {
    const allComments = [];
    const topicId = win.location.pathname.match(/\/t\/(\d+)/)?.[1];
    if (!topicId) return allComments;

    // 解析分页
    const pagination = $(".cell.ps_container");
    let currentPage = 1;
    let totalPages = 1;

    if (pagination) {
      const current = pagination.querySelector("div.page_current");
      if (current) currentPage = parseInt(current.textContent) || 1;
      const pages = [...pagination.querySelectorAll("a.page_normal")];
      if (pages.length > 0) {
        totalPages = Math.max(
          parseInt(pages[pages.length - 1].textContent) || 1,
          currentPage,
        );
      }
    }

    for (let page = 1; page <= totalPages; page++) {
      onProgress?.(page, totalPages);
      try {
        if (page === currentPage) {
          allComments.push(...getPageComments(doc));
        } else {
          const res = await fetch(
            `https://www.v2ex.com/t/${topicId}?p=${page}`,
          );
          const text = await res.text();
          const parsed = new DOMParser().parseFromString(text, "text/html");
          allComments.push(...getPageComments(parsed));
        }
        if (page < totalPages) {
          await new Promise((r) => setTimeout(r, 500));
        }
      } catch (e) {
        console.error(`获取第 ${page} 页评论失败:`, e);
      }
    }

    return allComments;
  }

  function getPageComments(document) {
    return [...document.querySelectorAll('div[id^="r_"].cell')]
      .map((el) =>
        el
          .querySelector(".reply_content")
          ?.textContent.replace(/\s+/g, " ")
          .trim(),
      )
      .filter(Boolean);
  }

  function getContainer() {
    const existing = $(".summary-container");
    if (existing) return existing;

    const header = $(".header");
    if (!header) return null;

    const container = createElement("div", {
      className: "summary-container",
      style: `margin:10px 0;padding:15px;background:var(--box-background-color,#fff);border-radius:6px;font-size:14px;line-height:1.6;display:none;border:1px solid var(--box-border-color,#eee);box-shadow:0 2px 4px rgba(0,0,0,.05)`,
    });

    // 工具栏
    const toolbar = createElement("div", {
      style:
        "display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--box-border-color,#eee)",
    });
    const titleArea = createElement("div", {
      style: "display:flex;align-items:center;gap:10px",
    });

    const title = createElement("div", {
      innerHTML: "📝 文章总结",
      style: "font-weight:500",
    });

    const regenBtn = createElement("a", {
      href: "javascript:void(0)",
      className: "tb",
      innerHTML: "🔄 重新生成",
      style: "font-size:12px",
    });

    regenBtn.onclick = async () => {
      if (regenBtn.dataset.loading === "1") return;
      const articleContent = $(".topic_content")?.textContent.trim();
      if (!articleContent) return;
      const cont = $(".summary-content", container);
      const sumBtn = $(".summary-button");
      await runSummary(regenBtn, container, cont, articleContent);
      regenBtn.dataset.loading = "";
    };

    const closeBtn = createElement("span", {
      innerHTML: "✕",
      style: "cursor:pointer;opacity:.6;font-size:16px;padding:4px 8px",
    });
    closeBtn.onclick = () => (container.style.display = "none");

    titleArea.appendChild(title);
    titleArea.appendChild(regenBtn);
    toolbar.appendChild(titleArea);
    toolbar.appendChild(closeBtn);
    container.appendChild(toolbar);

    // 内容区
    const cont = createElement("div", {
      className: "summary-content",
      style:
        "word-break:break-word;text-align:left;padding:10px 0;line-height:1.8",
    });
    container.appendChild(cont);

    header.parentNode.insertBefore(container, header.nextSibling);
    return container;
  }

  async function request(content, retries = 3, timeout = 30000) {
    const settings = store.getSettings();
    if (!settings.apiUrl || !settings.apiKey || !settings.modelName) {
      const cont = $(".summary-content");
      if (cont) {
        cont.textContent =
          "请先完成设置（API URL、API Key 和模型名称为必填项）";
        cont.dataset.error = "1";
      }
      return null;
    }

    for (let i = 0; i < retries; i++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const res = await fetch(settings.apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${settings.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              { role: "system", content: settings.prompt || defaultPrompt },
              { role: "user", content },
            ],
            model: settings.modelName,
            stream: false,
          }),
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return (
          data.choices?.[0]?.message?.content ||
          "总结生成失败，请检查 API 返回格式"
        );
      } catch (e) {
        clearTimeout(timer);
        if (i === retries - 1) {
          console.error("请求最终失败:", e);
          return null;
        }
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
        const cont = $(".summary-content");
        if (cont)
          cont.textContent = `请求失败，正在重试（${i + 2}/${retries}）...`;
      }
    }
    return null;
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", summary);
  } else {
    summary();
  }
})();

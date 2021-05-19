"improve performance
set nocursorcolumn
set nocursorline
set norelativenumber
syntax sync minlines=256
set synmaxcol=200
set scrolljump=5
" Fundamental settings
set fileencoding=utf-8
set fileencodings=ucs-bom,utf-8,gbk,cp936,latin-1
set fileformat=unix
set fileformats=unix,dos,mac
set incsearch " Find as you type search
set hlsearch  " Highlight search terms
filetype on
filetype plugin on
filetype plugin indent on
syntax enable
set mouse=a   " Automatically enable mouse usage
set mousehide " Hide the mouse cursor while typing
"关闭单词拼写检查
set nospell
" Some useful settings
set smartindent
set expandtab      " tab to spaces
set linespace=0    " No extra spaces between rows
set winminheight=1 " Windows can be 0 line high
"设置宽度为2
set tabstop=2    " the width of a tab
set shiftwidth=2 " the width for indent
set ignorecase   " ignore the case when search texts
set smartcase    " if searching text contains uppercase case will not be ignored
set list
set listchars=tab:>>,eol:¬,trail:•,extends:#,nbsp:. " Highlight problematic whitespace
set background=dark " for the dark version
set number           "line number
set wrap             "line wrapping

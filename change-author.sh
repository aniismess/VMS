#!/bin/sh

git filter-branch --env-filter "
    GIT_AUTHOR_NAME=\"aniismess\"
    GIT_AUTHOR_EMAIL=\"animesh.mishra818@gmail.com\"
    GIT_COMMITTER_NAME=\"aniismess\"
    GIT_COMMITTER_EMAIL=\"animesh.mishra818@gmail.com\"
" --tag-name-filter cat -- --branches --tags

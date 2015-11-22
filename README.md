# environments
Environments

This repository contains all files that form the environments subtree for the master repositories (e.g. core, mask, kick, chat, skin, bits, reap). It focuses on providing logic for the different environments each master server runs in (e.g. core server could run in development or production environment).

By separating the environment logic into this self-contained subtree, all changes to this code base can be centrally administrered. Master repositories get updated by pulling their subtrees from Github.

See also http://blogs.atlassian.com/2013/05/alternatives-to-git-submodule-git-subtree/

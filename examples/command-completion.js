/*
List of subcommands for common programs such as git, docker, etc.
These lists are used by the command completion plugin, which activates
when the user types "tab".
*/
let git = `add##Add file contents to the index.
am##Apply a series of patches from a mailbox.
annotate##Annotate file lines with commit information.
archimport##Import an Arch repository into Git.
archive##Create an archive of files from a named tree.
bisect##Use binary search to find the commit that introduced a bug.
blame##Show what revision and author last modified each line of a file.
branch##List, create, or delete branches.
bundle##Move objects and refs by archive.
checkout##Switch branches or restore working tree files.
cherry##Find commits yet to be applied to upstream.
cherry-pick##Apply the changes introduced by some existing commits.
citool##Graphical alternative to commit.
clean##Remove untracked files from the working tree.
clone##Clone a repository into a new directory.
commit##Record changes to the repository.
config##Get and set repository or global options.
count-objects##Count unpacked number of objects and their disk consumption.
cvsexportcommit##Export a single commit to a CVS checkout.
cvsimport##Salvage your data out of another SCM people love to hate.
cvsserver##A CVS server emulator for Git.
describe##Give an object a human readable name based on an available ref.
diff##Show changes between commits, commit and working tree, etc.
difftool##Show changes using common diff tools.
fast-export##Git data exporter.
fast-import##Backend for fast Git data importers.
fetch##Download objects and refs from another repository.
filter-branch##Rewrite branches.
format-patch##Prepare patches for e-mail submission.
fsck##Verifies the connectivity and validity of the objects in the database.
gc##Cleanup unnecessary files and optimize the local repository.
get-tar-commit-id##Extract commit ID from an archive created using archive.
gitk##The Git repository browser.
gitweb##Git web interface (web frontend to Git repositories).
grep##Print lines matching a pattern.
gui##A portable graphical interface to Git.
help##Display help information about Git.
imap-send##Send a collection of patches from stdin to an IMAP folder.
init##Create an empty Git repository or reinitialize an existing one.
instaweb##Instantly browse your working repository in gitweb.
log##Show commit logs.
merge-tree##Show three-way merge without touching index.
merge##Join two or more development histories together.
mergetool##Run merge conflict resolution tools to resolve merge conflicts.
mv##Move or rename a file, a directory, or a symlink.
notes##Add or inspect object notes.
p4##Import from and submit to Perforce repositories.
pack-refs##Pack heads and tags for efficient repository access.
prune##Prune all unreachable objects from the object database.
pull##Fetch from and integrate with another repository or a local branch.
push##Update remote refs along with associated objects.
quiltimport##Applies a quilt patchset onto the current branch.
rebase##Reapply commits on top of another base tip.
reflog##Manage reflog information.
remote##Manage set of tracked repositories.
repack##Pack unpacked objects in a repository.
replace##Create, list, delete refs to replace objects.
request-pull##Generates a summary of pending changes.
rerere##Reuse recorded resolution of conflicted merges.
reset##Reset current HEAD to the specified state.
rev-parse##Pick out and massage parameters.
revert##Revert some existing commits.
rm##Remove files from the working tree and from the index.
send-email##Send a collection of patches as emails.
shortlog##Summarize git log output.
show-branch##Show branches and their commits.
show##Show various types of objects.
stash##Stash the changes in a dirty working directory away.
status##Show the working tree status.
submodule##Initialize, update or inspect submodules.
svn##Bidirectional operation between a Subversion repository and Git.
tag##Create, list, delete or verify a tag object signed with GPG.
verify-commit##Check the GPG signature of commits.
verify-tag##Check the GPG signature of tags.
whatchanged##Show logs with difference each commit introduces.
worktree##Manage multiple working trees.`.split('\n')

let docker = ('builder config container context image network node plugin ' +
    'secret service stack swarm system trust volume' +
    'attach build commit cp create deploy diff events exec export ' +
    'history images import info inspect kill load login logout logs pause ' +
    'port ps pull push rename restart rm rmi run save search start stats ' +
    'stop tag top unpause update version wait').split(' ')

let dockerContainer = ('attach commit cp create diff exec export inspect ' +
    'kill logs ls pause port prune rename restart rm run start stats stop ' +
    'top unpause update wait').split(' ')

let dockerImage = ('build history import inspect load ls prune ' +
    'pull push rm save tag ').split(' ')

let kubectl = ('create expose run set explain get edit delete rollout scale ' +
    'autoscale certificate cluster top cordon uncordon drain taint describe ' +
    'logs attach exec port proxy cp auth diff apply patch replace wait ' +
    'convert kustomize label annotate completion api api config plugin ' +
    'version ').split(' ')

let npm = ('access adduser audit bin bugs c cache ci cit clean-install ' +
    'clean-install-test completion config create ddp dedupe deprecate ' +
    'dist-tag docs doctor edit explore fund get help help-search hook i init ' +
    'install install-ci-test install-test it link list ln login logout ls ' +
    'org outdated owner pack ping prefix profile prune publish rb rebuild ' +
    'repo restart root run run-script s se search set shrinkwrap star ' +
    'stars start stop t team test token tst un uninstall unpublish unstar ' +
    'up update v version view whoami').split(' ')

module.exports = {
    git,
    docker,
    'docker container': dockerContainer,
    'docker image': dockerImage,
    kubectl,
    npm
}

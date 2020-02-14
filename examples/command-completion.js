/*
List of subcommands for common programs such as git, docker, etc.
These lists are used by the command completion plugin, which activates
when the user types "tab".
*/

//------------------------------ git ------------------------------

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


//------------------------------ docker ------------------------------

let docker = `builder##Manage builds
config##Manage Docker configs
container##Manage containers
context##Manage contexts
image##Manage images
network##Manage networks
node##Manage Swarm nodes
plugin##Manage plugins
secret##Manage Docker secrets
service##Manage services
stack##Manage Docker stacks
swarm##Manage Swarm
system##Manage Docker
trust##Manage trust on Docker images
volume##Manage volumes
attach##Attach local standard input, output, and error streams to a running container
build##Build an image from a Dockerfile
commit##Create a new image from a container's changes
cp##Copy files/folders between a container and the local filesystem
create##Create a new container
diff##Inspect changes to files or directories on a container's filesystem
events##Get real time events from the server
exec##Run a command in a running container
export##Export a container's filesystem as a tar archive
history##Show the history of an image
images##List images
import##Import the contents from a tarball to create a filesystem image
info##Display system-wide information
inspect##Return low-level information on Docker objects
kill##Kill one or more running containers
load##Load an image from a tar archive or STDIN
login##Log in to a Docker registry
logout##Log out from a Docker registry
logs##Fetch the logs of a container
pause##Pause all processes within one or more containers
port##List port mappings or a specific mapping for the container
ps##List containers
pull##Pull an image or a repository from a registry
push##Push an image or a repository to a registry
rename##Rename a container
restart##Restart one or more containers
rm##Remove one or more containers
rmi##Remove one or more images
run##Run a command in a new container
save##Save one or more images to a tar archive (streamed to STDOUT by default)
search##Search the Docker Hub for images
start##Start one or more stopped containers
stats##Display a live stream of container(s) resource usage statistics
stop##Stop one or more running containers
tag##Create a tag TARGET_IMAGE that refers to SOURCE_IMAGE
top##Display the running processes of a container
unpause##Unpause all processes within one or more containers
update##Update configuration of one or more containers
version##Show the Docker version information
wait##Block until one or more containers stop, then print their exit codes`
.split('\n')

let dockerContainer = `attach##Attach local standard input, output, and error streams to a running container
commit##Create a new image from a container's changes
cp##Copy files/folders between a container and the local filesystem
create##Create a new container
diff##Inspect changes to files or directories on a container's filesystem
exec##Run a command in a running container
export##Export a container's filesystem as a tar archive
inspect##Display detailed information on one or more containers
kill##Kill one or more running containers
logs##Fetch the logs of a container
ls##List containers
pause##Pause all processes within one or more containers
port##List port mappings or a specific mapping for the container
prune##Remove all stopped containers
rename##Rename a container
restart##Restart one or more containers
rm##Remove one or more containers
run##Run a command in a new container
start##Start one or more stopped containers
stats##Display a live stream of container(s) resource usage statistics
stop##Stop one or more running containers
top##Display the running processes of a container
unpause##Unpause all processes within one or more containers
update##Update configuration of one or more containers
wait##Block until one or more containers stop, then print their exit codes`
.split('\n')

let dockerImage = `build##Build an image from a Dockerfile
history##Show the history of an image
import##Import the contents from a tarball to create a filesystem image
inspect##Display detailed information on one or more images
load##Load an image from a tar archive or STDIN
ls##List images
prune##Remove unused images
pull##Pull an image or a repository from a registry
push##Push an image or a repository to a registry
rm##Remove one or more images
save##Save one or more images to a tar archive (streamed to STDOUT by default)
tag##Create a tag TARGET_IMAGE that refers to SOURCE_IMAGE`.split('\n')

let dockerNetwork = `connect##Connect a container to a network
create##Create a network
disconnect##Disconnect a container from a network
inspect##Display detailed information on one or more networks
ls##List networks
prune##Remove all unused networks
rm##Remove one or more networks`.split('\n')


//------------------------------ kubectl ------------------------------

let kubectl = `create##Create a resource from a file or from stdin.
expose##Take a replication controller, service, deployment or pod and expose it as a new Kubernetes Service
run##Run a particular image on the cluster
set##Set specific features on objects
explain##Documentation of resources
get##Display one or many resources
edit##Edit a resource on the server
delete##Delete resources by filenames, stdin, resources and names, or by resources and label selector
rollout##Manage the rollout of a resource
scale##Set a new size for a Deployment, ReplicaSet, Replication Controller, or Job
autoscale##Auto-scale a Deployment, ReplicaSet, or ReplicationController
certificate##Modify certificate resources.
cluster-info##Display cluster info
top##Display Resource (CPU/Memory/Storage) usage.
cordon##Mark node as unschedulable
uncordon##Mark node as schedulable
drain##Drain node in preparation for maintenance
taint##Update the taints on one or more nodes
describe##Show details of a specific resource or group of resources
logs##Print the logs for a container in a pod
attach##Attach to a running container
exec##Execute a command in a container
port-forward##Forward one or more local ports to a pod
proxy##Run a proxy to the Kubernetes API server
cp##Copy files and directories to and from containers.
auth##Inspect authorization
diff##Diff live version against would-be applied version
apply##Apply a configuration to a resource by filename or stdin
patch##Update field(s) of a resource using strategic merge patch
replace##Replace a resource by filename or stdin
wait##Experimental: Wait for a specific condition on one or many resources.
convert##Convert config files between different API versions
kustomize##Build a kustomization target from a directory or a remote url.
label##Update the labels on a resource
annotate##Update the annotations on a resource
completion##Output shell completion code for the specified shell (bash or zsh)
api-resources##Print the supported API resources on the server
api-versions##Print the supported API versions on the server, in the form of "group/version"
config##Modify kubeconfig files
plugin##Provides utilities for interacting with plugins.
version##Print the client and server version information`.split('\n')


//------------------------------ npm ------------------------------

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
    'docker network': dockerNetwork,
    kubectl,
    npm
}

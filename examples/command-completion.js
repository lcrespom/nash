/*
List of subcommands for common programs such as git, docker, etc.
These lists are used by the command completion plugin, which activates
when the user types "tab".
*/
const path = require('path')

const env = require(NASH_BASE + '/env')


let git = ('add am archive bisect branch bundle checkout cherry citool clean ' +
    'clone commit describe diff fetch format gc gitk grep gui init log ' +
    'merge mv notes pull push range rebase reset revert rm shortlog show ' +
    'stash status submodule tag worktree').split(' ')

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


//-------------------- Subcommand function for `cd` --------------------
function getBaseDir(word) {
    // Compute base directory (absolute or relative)
    // TODO support for `~` => home dir
    let baseDir
    if (word.startsWith('/'))
        baseDir = ''
    else
        baseDir = process.cwd() +'/'
    // Search word is full directory
    if (word.endsWith('/'))
        baseDir += word
    // Search word is partial directory name
    else if (word.includes('/'))
        baseDir += path.dirname(word) + '/'
    return baseDir
}

function cd(command, word) {
    let baseDir = getBaseDir(word)
    // Get all directories
    let dirs
    try {
            dirs = env.getDirs(baseDir)
            .map(dirent => dirent.name + '/')
    }
    catch (err) {
        return null // Command failed, rely on default completion
    }
    // Discard hidden directories, unless explicitly requested
    if (!path.basename(word).startsWith('.'))
        dirs = dirs.filter(name => !name.startsWith('.'))
    // Now prefix names in result
    if (word.endsWith('/'))
        dirs = dirs.map(d => word + d)
    else if (word.includes('/'))
        dirs = dirs.map(d => path.dirname(word) + '/' + d)
    // Finally, filter out the files that don't start with the search word
    return dirs.filter(dir => dir.startsWith(word))
}


module.exports = {
    cd,
    git,
    docker,
    'docker container': dockerContainer,
    'docker image': dockerImage,
    kubectl,
    npm
}

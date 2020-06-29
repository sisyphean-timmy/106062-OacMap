const fs = require('fs')
const { spawn } = require('child_process')

/**
 * @see https://nodejs.org/api/child_process.html
 * @see https://www.npmjs.com/package/msdeploy
 */
if (!fs.existsSync("deployConfig.json")) {
    console.error("No deploy setting deployConfig.json")
    return
}

const config = JSON.parse(fs.readFileSync("deployConfig.json").toString())

const ls = spawn("msdeploy", [
    "--verb", "sync",
    "--allowUntrusted", "true",
    "--source", `contentPath=${config.dist}`,
    "--dest", `contentPath=${config.dest},ComputerName=${config.ComputerName},UserName=${config.UserName},Password=${config.Password},AuthType=Basic,includeAcls=False`
], {
    shell: true
})
ls.stdout.on('data', data => console.log(`stdout: ${data}`))
ls.stderr.on('data', data => console.error(`stderr: ${data}`))
ls.on('close', code => console.log(`child process exited with code ${code}`))
#!/usr/bin/env node

/*
@raw-nodes:
    - 007e481d247a44b269cee4d2331ef2f1
    - 056c194e1d7543e014c717167fbe0dce
    - 1a9fecff8ec1a1864b6ff09b3e5b273a
    - 28577a509b47fb0eedac1aeec26a01b1
    - 35044b8d9071c841c285357c1636cab1
    - 36e6c2eb982d27b4afd1207a64ad20ac
    - 40d45e026bc9e159154d2db2e6ae0f37
    - 8101808834776ad1a9db9b00daa7fd1a
    - 8a7169c842ae799a0e08a266c44d0343
    - ddf5ece9042298dedea9a82a5c846dc8
    - fda1b568a7204c052bd5caa892b2dafc
    - fe8b8392fba4a7e658a93582f765235d
*/

const fs = require('fs');
const inquirer = require('inquirer');
const crypto = require('crypto');
const { exec } = require('child_process');
const { Spinner } = require('cli-spinner');
const colors = require('colors');

(async () => {
    const { name } = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Project name:',
            validate: (value) => {
                if (!value || fs.existsSync(`./${value}`)) {
                    return 'Please enter a valid project name';
                }

                return true;
            },
        },
    ]);

    const config = await inquirer.prompt([
        {
            type: 'list',
            message: 'Select framework:',
            name: 'framework',
            choices: [
                'React',
                'Vanilla.js',
            ],
        },
        {
            type: 'list',
            message: 'Select CSS preprocessor:',
            name: 'css',
            choices: [
                'SCSS',
                'Stylus',
                'none',
            ],
        },
        {
            type: 'list',
            message: 'Select ESLint config:',
            name: 'linter',
            choices: [
                'airbnb',
                'none',
            ],
        },
    ]);

    const base = [config.framework, config.css, config.linter];
    const mode = crypto.createHash('md5').update(base.toString()).digest('hex');

    const execString = `
        curl https://cdn.dayler.io/mkweb/raw/${mode}.tar -o ./${mode}.tar && \
        tar -xvf ./${mode}.tar && \
        mv ./${mode} ./${name} && \
        rm -rf ./${mode} && \
        rm ./${mode}.tar && \
        cd ./${name} && \
        sed -i -e 's/{name}/${name}/g' ./package.json && \
        sed -i -e 's/{name}/${name}/g' ./README.md && \
        rm package.json-e && \
        rm README.md-e && \
        yarn && \
        cd ..
    `;

    const spinner = new Spinner('Installing dependencies... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();

    exec(execString, () => {
        spinner.stop(true);
        process.stdout.write(`${colors.yellow.bold('Done!')}\n\n${colors.grey('$')} ${colors.blue(`cd ./${name}`)}\n${colors.grey('$')} ${colors.blue('yarn start')}\n\n${colors.cyan(`Open ${colors.bold.underline('http://localhost:8000')} in browser and enjoy your code!`)}\n...\n`);
    });
})();

const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

const isTrue = (variable) => {
    const lowercase = variable.toLowerCase();
    return (
        lowercase === '1' ||
        lowercase === 't' ||
        lowercase === 'true' ||
        lowercase === 'y' ||
        lowercase === 'yes'
    );
}

async function run() {
    try {
        const context = github.context;
        // Possible values are success, failure, or cancelled.
        const jobStatus = core.getInput('job_status');

        const options = {};
        options.env = Object.assign(process.env, {
            GITHUB_ACTION: process.env.GITHUB_ACTION,
            GITHUB_RUN_ID: process.env.GITHUB_RUN_ID,
            GITHUB_REF: process.env.GITHUB_REF,
            GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY,
            GITHUB_SHA: process.env.GITHUB_SHA,
            GITHUB_HEAD_REF: process.env.GITHUB_HEAD_REF || '',
        });

        const url = core.getInput('url');
        const topic = core.getInput('topic');
        const icon = core.getInput('icon') || null;

        const defaults = JSON.parse(core.getInput('default'));
        let ntfy = Object.assign(defaults, JSON.parse(core.getInput('on_success') || '{}'));
        if (jobStatus !== 'success') {
            ntfy = Object.assign(defaults, JSON.parse(core.getInput('on_failure') || '{}'));
        }

        // d $'Repo: ${{ github.repository }}\nCommit: ${{ github.sha }}\nRef: ${{ github.ref }}\nStatus: ${{ job.status}}' \

        const response = await axios({
            method: 'POST',
            url: url,
            data: JSON.stringify({
                'topic': topic,
                'icon': icon,
                'priority': ntfy.priority || 3,
                'tags': ntfy.tags || [],
                'title': ntfy.title,
                'message': ntfy.message,
                'actions': ntfy.actions || [],
                'click': ntfy.click || null
            })
        })

        core.setOutput('response', {
            'statusCode': response.statusCode
        });
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
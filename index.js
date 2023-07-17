const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

const isTrue = (variable) => {
    const lowercase = variable.toLowerCase();
    return (lowercase === '1' || lowercase === 't' || lowercase === 'true' || lowercase === 'y' || lowercase === 'yes');
}

async function run() {
    try {
        const context = github.context;
        // Possible values are success, failure, or cancelled.
        const jobStatus = core.getInput('job_status');

        const url = core.getInput('url');
        const topic = core.getInput('topic');
        const icon = core.getInput('icon') || null;

        const ntfy = {};
        ntfy.message = `Successfully ran workflow "${context.workflow}"`;
        ntfy.tags = ['white_check_mark'];

        if (jobStatus !== 'success') {
            ntfy.message = `Workflow run "${context.workflow}" has failed`;
            ntfy.priority = 4;
            ntfy.tags = ['x'];
        }

        const response = await axios({
            method: 'POST', url: url, data: JSON.stringify({
                'topic': topic,
                'icon': icon,
                'priority': ntfy.priority || 3,
                'tags': ntfy.tags || [],
                'title': context.payload.repository.full_name,
                'message': ntfy.message,
                'actions': [
                    {
                        "action": "view",
                        "label": "Visit Repo",
                        "url": context.payload.repository.html_url,
                        "clear": true
                    },
                    {
                        "action": "view",
                        "label": "View Run",
                        "url": `${context.payload.repository.html_url}/actions/runs/${context.runId}`,
                        "clear": true
                    }
                ],
                'click': context.payload.repository.html_url
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
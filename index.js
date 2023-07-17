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
        const jobStatus =core.getInput('job_status');

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

        core.info(`Connecting to endpoint (${url}) ...`)

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

/**
 *
 *   curl ntfy.sh \
 *   -d '{
 *     "topic": "3d8c3c88-4932-4eb7-b8e9-b5338fa37e8c",
 *     "priority": 2,
 *  	"tags": ["warning","cd"],
 *     "title": "Unauthorized access detected",
 *     "message": "This is a cool message",
 *     "click": "https://home.nest.com/",
 *     "attach": "https://cdn.britannica.com/16/234216-050-C66F8665/beagle-hound-dog.jpg",
 *     "icon": "https://styles.redditmedia.com/t5_32uhe/styles/communityIcon_xnt6chtnr2j21.png",
 *     "actions": [
 *       {
 *         "action": "view",
 *         "label": "Open Twitter",
 *         "url": "https://twitter.com/binwiederhier/status/1467633927951163392",
 *         "clear": true
 *       }
 *     ]
 *   }'
 */
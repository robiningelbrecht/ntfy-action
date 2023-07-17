# ntfy.sh action

Send notifications to ntfy.sh using GitHub Action workflow

## Inputs

### `url`

**Required** The ntfy server URL

### `topic`

**Required** The ntfy topic

### `icon`

**Required** URL to an icon to display in the notification

### `job_status`

**Required** The job status. Should always be `${{ job.status }}`, except if you want to force a status.

## Example usage

```yaml
uses: robiningelbrecht/ntfy-action
with:
    url: ${{ secrets.NTFY_URL }}
    topic: ${{ secrets.NTFY_TOPIC }}
    icon: 'https://github.githubassets.com/images/modules/profile/achievements/starstruck-default.png'
    job_status: ${{ job.status }}
```

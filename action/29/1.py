   import requests
   from datetime import datetime, timedelta
   import os

   # GitHub API URL
   API_URL = 'https://api.github.com/repos/{owner}/{repo}/issues'
   TOKEN = os.getenv('GITHUB_TOKEN')

   # 設置要過期的天數
   EXPIRY_DAYS = 30

   def get_old_issues():
       headers = {'Authorization': f'token {TOKEN}'}
       response = requests.get(API_URL.format(owner='your-username', repo='your-repo'), headers=headers)
       issues = response.json()

       old_issues = []
       for issue in issues:
           created_at = datetime.strptime(issue['created_at'], '%Y-%m-%dT%H:%M:%SZ')
           if (datetime.utcnow() - created_at) > timedelta(days=EXPIRY_DAYS):
               old_issues.append(issue)

       return old_issues

   def close_issues(issues):
       headers = {'Authorization': f'token {TOKEN}', 'Accept': 'application/vnd.github.v3+json'}
       for issue in issues:
           issue_number = issue['number']
           url = f'https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}'
           requests.patch(url, headers=headers, json={'state': 'closed'})
           print(f'Closed issue #{issue_number}')

   if __name__ == '__main__':
       old_issues = get_old_issues()
       close_issues(old_issues)
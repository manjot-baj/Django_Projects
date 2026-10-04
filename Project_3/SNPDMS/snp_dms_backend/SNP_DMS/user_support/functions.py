import requests
from requests.auth import HTTPBasicAuth
from decouple import config


class JiraClient:
    def __init__(self):
        self.base_url = config("JIRA_BASE_URL")
        self.auth = HTTPBasicAuth(
            config("JIRA_EMAIL"),
            config("JIRA_API_TOKEN"),
        )
        self.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

    def get_project_id(self, project_key: str) -> str:
        response = requests.get(
            f"{self.base_url}/rest/api/3/project/{project_key}",
            auth=self.auth,
        )
        response.raise_for_status()
        return response.json()["id"]

    def get_issue_type_id(self, project_id: str) -> str:
        response = requests.get(
            f"{self.base_url}/rest/api/3/issuetype/project",
            params={"projectId": project_id},
            auth=self.auth,
        )
        response.raise_for_status()

        issue_types = response.json()

        for preferred in ("Task", "Bug"):
            for it in issue_types:
                if it["name"] == preferred and not it["subtask"]:
                    return it["id"]

        for it in issue_types:
            if not it["subtask"]:
                return it["id"]

        raise Exception("No valid non-subtask issue type found")

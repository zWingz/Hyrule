import http from '../http'
import { GetIssuesParams, CreateIssueParams } from '../http/types';

class Octo {
  async getIssues(arg?: GetIssuesParams) {
    return http.getIssues(arg)
  }
  saveIssues(issue: CreateIssueParams, num?: number) {
    if(num) {
      return http.editIssue(num, issue)
    } else {
      return http.createIssue(issue)
    }
  }
}

const IssuesKit = new Octo()
export { IssuesKit }

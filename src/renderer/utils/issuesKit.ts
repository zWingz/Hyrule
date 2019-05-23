import http from '../http'
import { GetIssuesParams } from '../http/types';

class Octo {
  async getIssues(arg?: GetIssuesParams) {
    return http.getIssues(arg)
  }
}

const IssuesKit = new Octo()
export { IssuesKit }

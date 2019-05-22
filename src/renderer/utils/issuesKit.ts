import http from '../http'

class Octo {
  async getIssues() {
    return http.getIssues()
  }
}

const IssuesKit = new Octo()
export { IssuesKit }

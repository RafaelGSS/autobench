class MarkdownReview {
  constructor() {
    this.reviewMessage = '';
  }

  addRequestChanges(route, output) {
    if (this.reviewMessage === '') {
      this.initRequestChangesMessage()
    }

    this.reviewMessage += `
      ---
      The previous benchmark for ${route} was significantly performatic than from this PR.

      - **Router**: ${route}
      - **Requests Diff**: ${output.requests.difference}
      - **Throughput Diff**: ${output.throughput.difference}
      - **Latency Diff**: ${output.latency.difference}
    `
  }

  initRequestChangesMessage() {
    this.reviewMessage = '## Performance Regression :alert:\n'
  }

  hasReview() {
    return this.reviewMessage !== ''
  }
}

module.exports = {
  MarkdownReview
}

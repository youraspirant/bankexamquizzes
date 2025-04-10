function quizList() {
  return {
    search: '',
    selectedTopic: '',
    selectedSubject: '',
    openTopic: null,
    topics: [],

    async init() {
      try {
        const response = await fetch('topics.json');
        const data = await response.json();
        this.topics = data;
      } catch (error) {
        console.error("Failed to load topics:", error);
      }
    },

    get uniqueSubjects() {
      return [...new Set(this.topics.map(t => t.subject))];
    },

    get filteredTopics() {
      return this.topics.filter(topic =>
        (!this.selectedSubject || topic.subject === this.selectedSubject) &&
        (topic.name.toLowerCase().includes(this.search.toLowerCase()) ||
          topic.quizzes.some(q =>
            q.name.toLowerCase().includes(this.search.toLowerCase()) ||
            (q.description && q.description.toLowerCase().includes(this.search.toLowerCase()))
          )
        )
      );
    },

    get filteredTopicsBySubject() {
      if (!this.selectedSubject) return this.topics;
      return this.topics.filter(t => t.subject === this.selectedSubject);
    },

    get filteredTopicOptions() {
      const seen = new Set();
      const topics = this.filteredTopicsBySubject.map(t => t.name).filter(name => {
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      });
      return topics;
    },

    quizFilter(quiz) {
      return quiz.name.toLowerCase().includes(this.search.toLowerCase()) ||
        (quiz.description && quiz.description.toLowerCase().includes(this.search.toLowerCase()));
    },

    toggleTopic(name) {
      this.openTopic = this.openTopic === name ? null : name;
    },

    startRandomQuiz(topic) {
      const visibleQuizzes = topic.quizzes.filter(q => this.quizFilter(q));
      if (visibleQuizzes.length > 0) {
        const randomQuiz = visibleQuizzes[Math.floor(Math.random() * visibleQuizzes.length)];
        window.location.href = `quiz.html?file=${randomQuiz.file}`;
      }
    }
  }
}

'use strict';

const Kue = use('App/Utils/Kue');

class JobService {
  constructor (queue) {
    this.queue = queue;
  }

  async complete (jobId) {
    const job = await this.get(jobId);
    job.complete();
  }

  remove (job) {
    return new Promise((resolve) => {
      job.remove((error) => {
        if (error) throw error;
        resolve();
      });
    });
  }

  dispatch (jobName, payload, delay) {
    return new Promise((resolve) => {
      const job = this.queue
        .create(jobName, payload)
        .delay(delay)
        .save((error) => {
          if (error) throw error;
          resolve(job);
        });
    });
  }

  get (id) {
    return new Promise((resolve) => {
      Kue.Job.get(id, (error, job) => {
        if (error) throw error;
        resolve(job);
      });
    });
  }
}

module.exports = JobService;

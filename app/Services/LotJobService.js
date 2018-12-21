'use strict';

const Redis = use('Redis');
const Moment = use('App/Utils/Moment');

class LotJobService {
  constructor (jobService) {
    this.jobService = jobService;
  }

  async runJobs (lot) {
    const { id } = lot;
    const payload = { id };
    const lotJobStart = await this.runStartJob(payload, lot.start_time);
    const lotJobEnd = await this.runEndJob(payload, lot.end_time);

    await this.writeLotJobsIds(id, {
      jobStartId: lotJobStart.id,
      jobEndId: lotJobEnd.id,
    });

    return this;
  }

  async removeJobs (lotId) {
    const { jobStartId, jobEndId } = await this.getLotJobsIds(lotId);
    const startJob = await this.jobService.get(jobStartId);
    const endJob = await this.jobService.get(jobEndId);

    await this.jobService.remove(startJob);
    await this.jobService.remove(endJob);
    await Redis.del(this.getLotJobKey(lotId));

    return this;
  }

  async writeLotJobsIds (lotId, data) {
    await Redis.set(this.getLotJobKey(lotId), JSON.stringify(data));

    return this;
  }

  async getLotJobsIds (lotId) {
    return JSON.parse(await Redis.get(this.getLotJobKey(lotId)));
  }

  async runStartJob (payload, startTime) {
    const delayToStart = this.calculateDelay(startTime);
    return await this.jobService.dispatch('LotStart', payload, delayToStart);
  }

  async runEndJob (payload, endTime) {
    const delayToStart = this.calculateDelay(endTime);
    return await this.jobService.dispatch('LotEnd', payload, delayToStart);
  }

  calculateDelay (to) {
    const current = Moment();
    const milliseconds = Moment(to).valueOf();

    return milliseconds - current.valueOf();
  }

  getLotJobKey (id) {
    return `lot_${id}_queue_data`;
  }
}

module.exports = LotJobService;

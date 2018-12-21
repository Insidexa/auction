'use strict';

const LotJobService = use('LotJobService');
const JobService = use('JobService');

class OrderHook {
  async afterCreate (order) {
    const lot = await order.lot().fetch();
    const { jobEndId } = await LotJobService.getLotJobsIds(lot.id);
    await JobService.complete(jobEndId);
  }
}

module.exports = OrderHook;

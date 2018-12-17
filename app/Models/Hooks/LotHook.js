'use strict';

const FS = use('FSService');

class LotHook {
  async beforeSave (lot) {
    if (lot.$originalAttributes && lot.$originalAttributes.image) {
      await FS.removeIfExists(lot.$originalAttributes.image);
    }
    if (lot.image) {
      lot.image = await FS.saveImageFromBase64(lot.image);
    }
  }

  async afterDelete (lot) {
    if (lot.image) {
      await FS.removeIfExists(lot.image);
    }
  }
}

module.exports = LotHook;

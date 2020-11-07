'use strict';

const AbstractService = require('./abstract');

class MilitaryBaseService extends AbstractService {
  async create (id, parent, children, isLowest=false) {
    let path = null;
    if (parent) {
      const { path: parentPath } = await this.models.MilitaryBase.findOne({ _id: parent }).lean();
      path = this._createPathFromParent(parentPath, parent);
    }

    if (children) { // in the future this should be moved to queue
      for (let i = 0; i < children.length; i++) {
        const childPath = this._createPathFromParent(path, id);
        await this._updatePathAndChildren(children[i], childPath);
      }
    }

    return this.models.MilitaryBase.create({
      _id: id,
      path,
      isLowest
    });
  }

  async getAllChildren (id) {
    const { path } = await this.models.MilitaryBase.findOne({
      _id: id
    });

    const childPath = this._createPathFromParent(path, id);
    return this.models.MilitaryBase.find({
      path: new RegExp(`^${childPath}`)
    });
  }

  _createPathFromParent (parentPath, parent) {
    return (`${parentPath || ','}${parent},`);
  }

  async _updatePathAndChildren (id, newPath) {
    const { path } = await this.models.MilitaryBase.findOneAndUpdate({
      _id: id,
    }, {
      $set: {
        path: newPath
      }
    });
    const childPath = this._createPathFromParent(path, id);
    const children = await this.models.MilitaryBase.find({
      path: new RegExp(`^${childPath}`)
    });
    
    const newChildPath = this._createPathFromParent(newPath, id);
    for (let i = 0; i < children.length; i++) {
      await this._updatePathAndChildren(children[i]._id, newChildPath);
    }
  }

  async getAllLowest () {
    return this.models.MilitaryBase.find({ isLowest: true });
  }
}

module.exports = MilitaryBaseService;

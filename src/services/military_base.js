'use strict';

const AbstractService = require('./abstract');

class MilitaryBaseService extends AbstractService {
  async create (name, parent, children) {
    let path = null;
    if (parent) {
      const { _id: parentId, path: parentPath } = await this.models.MilitaryBase.findOneAndUpdate(
        { name: parent },
        { $set: { isLowest: false } }
      ).lean();
      path = this._createPathFromParent(parentPath, parentId);
    }

    const { _id } = await this.models.MilitaryBase.create({ 
      name, 
      path, 
      isLowest: !children || children.length === 0
    });

    if (children) { // in the future this should be moved to queue
      for (let i = 0; i < children.length; i++) {
        const childPath = this._createPathFromParent(path, _id);
        await this._updatePathAndChildren(children[i], childPath);
      }
    }
  }

  async getAllChildren (_id) {
    const { path } = await this.models.MilitaryBase.findOne({
      _id
    });

    const childPath = this._createPathFromParent(path, _id);
    return this.models.MilitaryBase.find({
      path: new RegExp(`^${childPath}`)
    });
  }

  _createPathFromParent (parentPath, parent) {
    return (`${parentPath || ','}${parent},`);
  }

  async _updatePathAndChildren (name, newPath) {
    const { _id, path } = await this.models.MilitaryBase.findOneAndUpdate({
      name,
    }, {
      $set: {
        path: newPath
      }
    });
    const childPath = this._createPathFromParent(path, _id);
    const children = await this.models.MilitaryBase.find({
      path: new RegExp(`^${childPath}`)
    });
    
    const newChildPath = this._createPathFromParent(newPath, _id);
    for (let i = 0; i < children.length; i++) {
      await this._updatePathAndChildren(children[i].name, newChildPath);
    }
  }

  async getAllLowest () {
    return this.models.MilitaryBase.find({ isLowest: true });
  }
}

module.exports = MilitaryBaseService;

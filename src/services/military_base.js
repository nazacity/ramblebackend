'use strict';

const AbstractService = require('./abstract');

class MilitaryBaseService extends AbstractService {
  list () {
    return this.models.MilitaryBase.find({});
  }

  async create (name, parent, children) {
    let path = null;
    if (parent) {
      const { _id: parentId, path: parentPath } = await this.models.MilitaryBase.findOneAndUpdate(
        { name: parent },
        { $set: { isLowest: false } }
      ).lean();
      path = this._createPathFromParent(parentPath, parentId);
    }

    const militaryBase = await this.models.MilitaryBase.create({ 
      name, 
      path, 
      isLowest: !children || children.length === 0
    });

    const { _id } = militaryBase;

    if (children) { // in the future this should be moved to queue
      for (let i = 0; i < children.length; i++) {
        const childPath = this._createPathFromParent(path, _id);
        await this._updatePathAndChildren(children[i], childPath);
      }
    }
    return militaryBase;
  }

  async getAllowedBases (_id) {
    return [_id.toString()].concat((await this.getAllChildren(_id)).map(({ _id })  => _id.toString()));
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

  async getAllLowest (_id) {
    return this.models.MilitaryBase.find({
      isLowest: true
    });
  }

  async getLowest (_id) {
    const base = await this.models.MilitaryBase.findOne({ _id });

    const { path, isLowest } = base;
    if (isLowest) {
      return [base];
    }

    const childPath = this._createPathFromParent(path, _id);
    return this.models.MilitaryBase.find({
      path: new RegExp(`^${childPath}`), isLowest: true
    });
  }
}

module.exports = MilitaryBaseService;

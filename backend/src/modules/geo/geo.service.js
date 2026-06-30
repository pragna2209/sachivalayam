const { District, Mandal, Village, Sachivalayam } = require('./geo.model');
const { NotFoundError, BadRequestError } = require('../../utils/appError');

const MODEL_BY_LEVEL = {
  district: District,
  mandal: Mandal,
  village: Village,
  sachivalayam: Sachivalayam
};

const PARENT_LEVEL_BY_LEVEL = {
  district: null,
  mandal: 'district',
  village: 'mandal',
  sachivalayam: 'village'
};

function getModel(level) {
  const model = MODEL_BY_LEVEL[level];
  if (!model) {
    throw new BadRequestError(`Unsupported geo level: ${level}`);
  }
  return model;
}

async function listByParent(level, parentId) {
  const model = getModel(level);
  const filter = { isActive: true };
  const parentLevel = PARENT_LEVEL_BY_LEVEL[level];
  if (parentLevel) {
    if (!parentId) {
      throw new BadRequestError(`parentId is required to list ${level} nodes`);
    }
    filter.parentId = parentId;
  }
  return model.find(filter).sort({ 'name.en': 1 }).lean();
}

async function createNode(level, payload) {
  const model = getModel(level);
  const parentLevel = PARENT_LEVEL_BY_LEVEL[level];

  if (parentLevel && !payload.parentId) {
    throw new BadRequestError(`parentId is required to create a ${level}`);
  }
  if (parentLevel) {
    const parentModel = getModel(parentLevel);
    const parentExists = await parentModel.exists({ _id: payload.parentId });
    if (!parentExists) {
      throw new NotFoundError(`Parent ${parentLevel} not found`);
    }
  }

  return model.create(payload);
}

async function updateNode(level, id, payload) {
  const model = getModel(level);
  const node = await model.findById(id);
  if (!node) {
    throw new NotFoundError('geo.notFound');
  }
  if (payload.code !== undefined) node.code = payload.code;
  if (payload.name) {
    node.name = { ...node.name.toObject(), ...payload.name };
  }
  if (payload.isActive !== undefined) node.isActive = payload.isActive;
  await node.save();
  return node;
}

async function softDeleteNode(level, id) {
  const model = getModel(level);
  const node = await model.findById(id);
  if (!node) {
    throw new NotFoundError('geo.notFound');
  }
  node.isActive = false;
  await node.save();
  return node;
}

async function getNodeById(level, id) {
  const model = getModel(level);
  const node = await model.findById(id).lean();
  if (!node) {
    throw new NotFoundError('geo.notFound');
  }
  return node;
}

module.exports = { listByParent, createNode, updateNode, softDeleteNode, getNodeById, getModel };

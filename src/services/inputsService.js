import db from './database';

const InputsService = {
  async addInput(templateId, xAxis, yAxis, value) {
    const id = await db.inputs.add({ templateId, xAxis, yAxis, value });
    return id;
  },

  async getInputsByTemplateId(templateId) {
    return await db.inputs.where('templateId').equals(templateId).toArray();
  },

  async updateInput(id, updatedData) {
    await db.inputs.update(id, updatedData);
  },

  async deleteInput(id) {
    await db.inputs.delete(id);
  },
};

export default InputsService;
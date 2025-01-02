import db from './database';

const TemplatesService = {
  async addTemplate(img, name) {
    const id = await db.templates.add({ img, name });
    return id;
  },

  async getAllTemplates() {
    return await db.templates.toArray();
  },

  async getTemplateById(id) {
    return await db.templates.get(id);
  },

  async getTemplateByName(name) {
    const lowerName = name.toLowerCase();
    return await db.templates
      .filter((template) => template.name.toLowerCase().includes(lowerName))
      .toArray();
  },

  async updateTemplate(id, updatedData) {
    await db.templates.update(id, updatedData);
  },

  async deleteTemplate(id) {
    await db.templates.delete(id);
  },
};

export default TemplatesService;
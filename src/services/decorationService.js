import db from './database';

const DecorationsService = {
  async addDecoration(blob, name) {
    const id = await db.decorations.add({ blob, name });
    return id;
  },

  async getAllDecorations() {
    return await db.decorations.toArray();
  },

  async getDecorationById(id) {
    return await db.decorations.get(id);
  },

  async getDecorationByName(name) {
    const lowerName = name.toLowerCase();
    return await db.decorations
      .filter((decoration) => decoration.name.toLowerCase().includes(lowerName))
      .toArray();
  },

  async updateDecoration(id, updatedData) {
    await db.decorations.update(id, updatedData);
  },

  async deleteDecoration(id) {
    await db.decorations.delete(id);
  },
};

export default DecorationsService;
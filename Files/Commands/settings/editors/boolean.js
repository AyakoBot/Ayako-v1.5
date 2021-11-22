module.exports = {
	key: ['boolean'],
	async execute(msg, i, embed, values, answer, AddRemoveEditView, fail, srmEditing, comesFromSRM) {
		if (!msg.rows[msg.assigner]) values[msg.assigner] = true;
		else values[msg.assigner] = false;
		return ['repeater', msg, i + 1, embed, values, answer, AddRemoveEditView, fail, srmEditing, comesFromSRM];
	}
};
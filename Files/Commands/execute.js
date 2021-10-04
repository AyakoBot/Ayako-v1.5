const Discord = require('discord.js');

module.exports = {
	name: 'execute',
	aliases: ['e'],
	perm: 268435456n, 
	dm: true,
	takesFirstArg: false,
	// eslint-disable-next-line no-unused-vars
	async exe(msg) {
		const Embed1 = new Discord.MessageEmbed()
			.setTitle('Animekos - Terraria')
			.setAuthor('This Terraria Server is Managed and Owned by Tamo#4269', 'https://cdn.discordapp.com/avatars/336557540513021952/c32c863424277183078b0f513b176bba.png?size=2048')
			.setThumbnail('https://img.utdstc.com/icon/73f/43d/73f43d3bab7c87c1975b7580cf96aea7dc6e5a8828cd85dc3f6d066fb5afd709:200')
			.setTitle('**__Required Mods:__**')
			.setDescription(
				'**Main:**\n'+
				'```\n'+
				'Calamity Mod(no calamity music)\n'+
				'Calamity Mod Music\n'+
				'Calamity Mod Music Extra\n'+
				'```\n'+
				'\n'+
				'**Quality of Life:**\n'+
				'```\n'+
				'Yet Another Boss Health Bar\n'+
				'Recipe Browser\n'+
				'Magic Storage\n'+
				'imksushi\'s mod\n'+
				'imksushi\'s mod old recipe enabler \n'+
				'AlchemistNPC lite\n'+
				'Wingslot\n'+
				'VeinMiner\n'+
				'Luiafk\n'+
				'MorePotions\n'+
				'Unlimited Potion Slots\n'+
				'Antisocial\n' +
				'Banner Bonanza\n' +
				'```'
			);
		const Embed2 = new Discord.MessageEmbed()
			.setTitle('**__Modded Terraria Server Rules__**')
			.setFooter('This Terraria Server is Managed and Owned by Tamo#4269', 'https://cdn.discordapp.com/avatars/336557540513021952/c32c863424277183078b0f513b176bba.png?size=2048')
			.addFields( 
				{name: '1. No griefing, sabotaging, random world-, or functional destruction', value: '```\nDon\'t grief other People\'s builds or arenas.\nDon\'t sabotage boss fights.\nDon\'t dig out large parts of the world without permission.\nDon\'t move NPCs away from where they live.\nNPC housings are to be placed easily accessible.\n```', inline: false},
				{name: '2. Boss Fights', value: 'Fighting bosses normally is fine, although we\'ll keep our hands off Wall of Flesh, Moon Lord, and Supreme Calamitas until everyone reaches the same stage in the game.', inline: false},
				{name: '3. Revengence or Death toggle-ers', value: 'It is forbidden to use Revengence or Death toggle-ers.\nThe (Terraria-) Server Owner will be the one to decide what mode the Server will be using, and after it has been chosen, you may not change it.', inline: false},
				{name: '4. Duping and Glitching', value: 'Duping items through any kind of glitching is not allowed.\nIf you are caught doing so, you will be removed from the Server without further notice.', inline: false},
				{name: '5. Potions', value: 'You are not allowed to have more than 22 potion effects.\nThis Rule will be removed once Supreme Calamitas is defeated.', inline: false},
				{name: '6. Chat behavior', value: 'Treat Server chat like a second <#298954459172700181>.\nMeaning, respect <#707411617502986250>', inline: false},
				{name: '7. Art', value: 'Any SFW and non-explicit Art is allowed.', inline: false},
				{name: '8. Mod Suggestions', value: 'You are allowed to Suggest new Mods in <#772516942769553418>.\nIf you do so, start a thread under your Suggestion which meets the following:\n```\nIs not Hero\'s Mod or Cheat Sheet\nDoes not give unfair advantages\nProvide a source Link to the mod\nProvide a List of Changes this Mod brings for Users to Vote.\n```\nYour Suggestion will be thoroughly studied by the (Terraria-) Server Owner.', inline: false},
				{name: '9. Defiled Rune and Iron Heart', value: 'Defiled Rune is fine, but Iron Heart is not.\nMake sure everyone on the Server is ok by you activating it anyway.', inline: false},
				{name: '10. Abuses and building behavior', value: 'Don\'t abuse anything.\nThere will be ONE hell-elevator.\nYou may not build your Base in any Draedon Lab\n(Planetoid, Hell, Jungle, Tundra, and Sunken Sea.)', inline: false},
				{ name: '\u200b', value: '\u200b', inline: false },
				{name: 'Join Credentials', value: 'IP: `54.37.245.91`\nPort: `25572`\n`54.37.245.91:25572`\nRequires tModLoader', inline: false},
				{name: '\u200b', value: 'Thanks to <@336557540513021952> For hosting and Managing this Terraria Server', inline: false},
				
			);
		(await msg.client.channels.cache.get('890160907542491146').messages.fetch('891003320448200756')).edit({embeds: [Embed1, Embed2]});
	}
};
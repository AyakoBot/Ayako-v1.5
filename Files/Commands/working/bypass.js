module.exports = {
	name: 'bypass',
	requiredPermissions: 4,
	ThisGuildOnly: ['298954459172700181'],
	Category: 'Moderation',
	description: 'Let a User skip the Verification',
	usage: 'h!bypass [user ID or mention]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (msg.mentions.users.first()){
			bypassFunction(msg.mentions.users.first());
		} else {
			if(args[0]){
				client.users.fetch(args[0]).then(user => {

					if(user && user.id){
						bypassFunction(user);
					}else{
						msg.reply('this user doesn\'t exist, be sure to provide a valid user ID or mention. **If you mentioned a user, use their ID instead**. Error code 1');
					}
				}).catch(e=>{
					msg.reply('this user doesn\'t exist, be sure to provide a valid user ID or mention. **If you mentioned a user, use their ID instead**. Error code 2');
					/* eslint-disable */
				let error;
				error = e;
				/* eslint-enable */
				}).catch({});
			} 
		}


		function bypassFunction(user){
			msg.react('670163913370894346').catch(()=>{});
			var BypassRole = msg.guild.roles.cache.find(role => role.id === '389470002992119810');
			var PreRole = msg.guild.roles.cache.find(role => role.id === '805315426543599676');
			msg.guild.member(user).roles.add(BypassRole)
				.then(user.send('You have been manually bypassed by a Staff Member').catch(() => {}));
			msg.guild.member(user).roles.remove(PreRole);
		}
	}
};
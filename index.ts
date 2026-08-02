import * as Discord from 'discord.js';
import chalk from 'chalk';
import prisoners from './prisoners.json' with { type: "json" };
import { writeFileSync } from 'node:fs'

console.log(chalk.yellow.bold('Starting...'))

const client = new Discord.Client({
	intents: [
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.MessageContent,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.GuildPresences,
		Discord.GatewayIntentBits.GuildMembers
	]
});

function logError(msg: any): void {
	console.error(chalk.red.bold(msg))
}

// let emojiArray;
client.on('clientReady', async () => {
	// emojiArray = Array.from((await client.application!.emojis.fetch()).values())
	// .map(e => e.animated ? `<a:${e.name}:${e.id}>` : `<:${e.name}:${e.id}>`);
	client.user!.setPresence({
		status: "dnd", // online | idle | dnd | invisible
		activities: [{
			type: Discord.ActivityType.Watching,
			name: "The Prisoners"
		}],
	});
	console.log(chalk.green.bold(`Logged in as ${client.user!.tag}`));
});

client.on('interactionCreate', async act => {
	try {
		if (!act.isChatInputCommand()) return;
		if (act.commandName === 'imprison') {
			prisoners.push(act.options.getUser('evildoer', true).id as never)
			writeFileSync('prisoners.json', JSON.stringify(prisoners))
			for (let i of prisoners) {
				try {
					(await act.guild?.members.fetch(i))!.roles.set([process.env.PRISONER_ROLE_ID!])
					for (const channel of (await act.guild?.channels.fetch()!).values()) {
						if (!channel || !channel?.isTextBased()) continue;
						const fetchedMsgs = await channel.messages.fetch({ limit: 100 });
						try {
							await channel.bulkDelete(fetchedMsgs.filter(m => m.author.id === i));
						} catch {
							await act.reply({ content: 'Messages older than 14 days, did not delete', flags: Discord.MessageFlags.Ephemeral })
						}
					}
				} catch {
					await act.reply({ content: 'An error occurred', flags: Discord.MessageFlags.Ephemeral })
				}
			}
			await act.reply({ content: 'Sent evildoer to prison', flags: Discord.MessageFlags.Ephemeral });
		} else if (act.commandName === 'release') {
			let prisoner: Discord.User = act.options.getUser('prisoner', true);
			(await act.guild?.members.fetch(prisoner))!.roles.set([process.env.REG_USR_ROLE_ID!])
			let index = prisoners.indexOf(prisoner.id as never)
			if (index !== -1) prisoners.splice(index, 1);
			writeFileSync('prisoners.json', JSON.stringify(prisoners))
		} else if (act.commandName === 'prisoners') {
			let list: string[] = [];
			for (let i of prisoners) {
				list.push(((await client.users.fetch(i)).username))
			}
			await act.reply({ content: '@' + list.join(', @'), flags: Discord.MessageFlags.Ephemeral })
		}
	} catch (e) {logError(e)}
});

client.login(process.env.BOT_TOKEN)
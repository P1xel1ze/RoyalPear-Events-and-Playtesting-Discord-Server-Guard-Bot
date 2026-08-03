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
async function reply(act: Discord.ChatInputCommandInteraction, msg: string) {
	return act.reply({ content: msg, flags: Discord.MessageFlags.Ephemeral })
}

// let emojiArray;
client.on('clientReady', async () => {
	// emojiArray = Array.from((await client.application!.emojis.fetch()).values())
	// .map(e => e.animated ? `<a:${e.name}:${e.id}>` : `<:${e.name}:${e.id}>`);
	client.user!.setPresence({
		status: process.env.STATUS as Discord.PresenceStatusData,
		activities: [{
			type: Discord.ActivityType.Watching,
			name: process.env.WATCHING!
		}],
	});
	console.log(chalk.green.bold(`Logged in as ${client.user!.tag}`));
});

client.on('interactionCreate', async act => {
	try {
		if (!act.isChatInputCommand()) return;
		if (act.commandName === 'imprison') {
			const newPrisonerID = act.options.getUser('evildoer', true).id
			if (prisoners.includes(newPrisonerID as never)) {
				await reply(act, 'Already a prisoner')
				return
			}
			prisoners.push(newPrisonerID as never)
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
							await reply(act, 'Messages older than 14 days, did not delete')
						}
					}
				} catch {
					await reply(act, 'An error occurred')
				}
			}
			await reply(act, 'Sent evildoer to prison');
		} else if (act.commandName === 'release') {
			let prisoner: Discord.User = act.options.getUser('prisoner', true);
			if (process.env.REG_USER_ROLE_ID === undefined) (await act.guild?.members.fetch(prisoner))!.roles.set([])
			else (await act.guild?.members.fetch(prisoner))!.roles.set([process.env.REG_USR_ROLE_ID!])
			let index = prisoners.indexOf(prisoner.id as never)
			if (index !== -1) prisoners.splice(index, 1);
			writeFileSync('prisoners.json', JSON.stringify(prisoners))
			await reply(act, 'Released from prison')
		} else if (act.commandName === 'prisoners') {
			if (prisoners.length === 0) {
				await reply(act, 'No prisoners')
				return
			}
			let list: string[] = [];
			for (let i of prisoners) {
				list.push(((await client.users.fetch(i)).username))
			}
			await reply(act, '@' + list.join(', @'))
		}
	} catch (e) {logError(e)}
});

client.login(process.env.BOT_TOKEN)
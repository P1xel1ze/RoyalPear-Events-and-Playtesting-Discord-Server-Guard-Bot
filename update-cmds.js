import { REST, SlashCommandBuilder, PermissionFlagsBits, Routes } from 'discord.js';
import chalk from 'chalk';

const cmds = [
	new SlashCommandBuilder().setName('imprison').setDescription('Send a user to prison').addUserOption(o=>o.setName('evildoer').setDescription('The naughty person to imprison').setRequired(true)),
	new SlashCommandBuilder().setName('prisoners').setDescription('Lists prisoners that have been imprisoned'),
	new SlashCommandBuilder().setName('release').setDescription('Releases a user from prison')
].map(c=>{return c.toJSON()})

console.log(chalk.yellow.bold('Registering slash commands...'));
await new REST({ version: '10' }).setToken(process.env.BOT_TOKEN).put(Routes.applicationCommands(process.env.APP_ID), { body: cmds });
console.log(chalk.green.bold('Slash commands registered!'));
const Discord = require('discord.js');
const discordClient = new Discord.Client();
const { TOKEN } = require('./config.json');
const fs = require('fs');
const readme = fs.readFileSync("README.md").toString();

const themeObject = require('./themeObject.json');

const article = function(msg){
	return "\`\`\`"+msg.replace(/\`/g, '=')+"\`\`\`";
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}
const randomPop = function(msgList){
    return msgList[getRandomInt(0, msgList.length)];
}
const getNamedArray = async (guild) => {

	const members = await guild.members.fetch();

	const membersArray = members.map((member)=>{
		const nickname = member.displayName;
		const roles = [...member.roles.cache];
		const hasNamed = roles.some((role)=> role[1].name === '네임드');
		return [nickname, hasNamed];
	});

	const namedMembers = membersArray.filter((element)=>element[1]).map((filteredMember)=>filteredMember[0]);

	return namedMembers.length > 0 ? namedMembers : [ '네임드 역할로 지정된 유저가 없습니다' ];
}

const randomTheme = function(themes, key){
	if(key === ''){
		let themeArray = Object.keys(themes).map(function (key) { 
			return [String(key)]; 
		}); 
		return randomPop(themeArray)
	}else if( key in themes){
		const subjects = themes[key];
		return randomPop(subjects);
	}else{
		return '해당 주제의 소분류는 존재하지 않습니다.';
	}
}

const printList = function(themes, key){
	if(key === ''){
		const themeArray = Object.keys(themes).map(function (key) { 
			return [String(key)]; 
		});

		return article(themeArray.join('\n'));

	}else if( key in themes){
		const subjects = themes[key];

		return article(subjects.join('\n'));

	}else{
		return '해당 주제의 소분류는 존재하지 않습니다.';
	}
}

discordClient.on('ready', () => {
  console.log(`Logged in as ${discordClient.user.tag}!`);
});

discordClient.on('message', async msg => {
	const {content, channel, author, guild} = msg;
	//const currentChannel = channel.name;
	const namedMembers = await getNamedArray(guild);
	const prefix = '=';

	if(author.bot){
		return;
	}

	// if(author.username === 'fact'){
	// 	console.log(namedMembers);
	// }

	if(content.substring(0,1) === prefix){
		String.prototype.replaceAt=function(index, character) {
			return this.substr(0, index) + character + this.substr(index+character.length);
		}

		const tempStr = content.substring(1);
		let commands = [];

		if(tempStr.includes(' ')){
			commands = tempStr.replaceAt(tempStr.indexOf(' '), '+').split('+');
		}else{
			commands.push(tempStr);
		}

		if(commands[0] === 'hellothisisverification'){
			channel.send('fact#4858(353467095876501504)');
			return;
		}

		if(commands[0] === '도움말'){
			channel.send(article(readme));
			return;
		}

		if(commands[0] === '목록' || commands[0] === 'l'){
			if(commands.length === 1){ // 대분류 목록
				channel.send(printList(themeObject, ''));
			}else if(commands.length === 2){ // 소분류 목록

				if(commands[1] === '네임드'){
					channel.send(article(namedMembers.join('\n')));
				}else{
					channel.send(printList(themeObject, commands[1]));
				}

			}
			return;
		}

		if(commands[0] === '주제' || commands[0] === 't'){
			if(commands.length === 1){ // 대분류 랜덤
				channel.send(randomTheme(themeObject, ''));
			}else if(commands.length === 2){ // 소분류 랜덤
				
				if(commands[1] === '네임드'){
					channel.send(randomPop(namedMembers));
				}else{
					channel.send(randomTheme(themeObject, commands[1]));
				}

			}
			return;
		}

		if(commands[0] === '네임드'){
			channel.send(randomPop(namedMembers));
			return;
		}

		channel.send(randomTheme(themeObject, commands[0]));
		return;
	}
});

discordClient.on("error", () => { console.log("error"); });

discordClient.login(TOKEN);
const prefixes = [
	':ok_hand: ',
	':robot: ',
	':speech_balloon: ',
	':thumbsup: ',
	':alien: ',
	':white_check_mark: '
];

const responses = [
	'_"The art and science of asking questions is the source of all knowledge."_ – Thomas Berger',
	'_"Judge a person by their questions rather than their answers."_ – Voltaire',
	'_"I only learn things when I ask questions."_ – Lou Holtz',
	'_"There are no right answers to wrong questions."_ – Ursula K. Le Guin',
	'_"Hypothetical questions get hypothetical answers."_ – Joan Baez',
	'_"Once you figure out the question, then the answer is relatively easy."_ – Elon Musk',
	'_"It is not the answer that enlightens, but the question."_ – Eugene Ionesco',
	'_"The only true wisdom is in knowing that you know nothing."_ – Socrates',
	'_"Always the beautiful answer who asks a more beautiful question."_ – E. E. Cummings'
	// '10-4 good buddy! :cop:\r\nI\'ll be sure to pass this along to <@U8MNYF3H6>.',
	// 'Check roger! <@U8MNYF3H6> will answer this during the Q&A session coming up.',
	// ':clown_face: pssh. and they said there were *"no stupid questions"*? Maybe, <@U8MNYF3H6> will answer your question... if you\'re lucky.',
	// ':stuck_out_tongue_winking_eye: How do you like me now? <@U8MNYF3H6> will answer Q&A.',
	// ':middle_finger: **ANSWER THIS**! <@U8MNYF3H6> says, "Hey now that\'s not necessary!'
];

const suffix = '\r\n<@U8MNYF3H6> will answer this during the Q&A session coming up.';

module.exports.process = () => {
	const min = 1;
	const responsemax = responses.length;
	const responserando = Math.floor(Math.random() * (responsemax - min + 1)) + min;
	const prefixmax = prefixes.length;
	const prefixrando = Math.floor(Math.random() * (prefixmax - min + 1)) + min;
	const theresponserandom = responserando - 1;
	const theprefixrandom = prefixrando - 1;
	const answer = prefixes[theprefixrandom] + responses[theresponserandom] + suffix;
	return answer;
};
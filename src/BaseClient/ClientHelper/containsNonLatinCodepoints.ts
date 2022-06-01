import ch from '../ClientHelper';

export default (text: string) => ch.regexes.emojiTester.test(text);

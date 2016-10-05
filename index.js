require('colors');

const psi = require('psi');
const checkPages = require('./pages');
const psiNames = require('./psiNameMap');

function removeCurlyBrace(string) {
  return string.replace(/\{\{\w+\}\}/g, '');
}

function printUrlBlocks(urlBlocks) {
  // If the first element is only header message, it won't have `urls`
  const { urls } = urlBlocks[0];
  if (!urls) {
    const advice = urlBlocks.shift();
    console.log(removeCurlyBrace(advice.header.format));
  }

  urlBlocks.forEach((resultUrlBlock) => {
    console.log(removeCurlyBrace(resultUrlBlock.header.format).cyan);
    if (resultUrlBlock.urls && Array.isArray(resultUrlBlock.urls)) {
      resultUrlBlock.urls.forEach((url) => {
        console.log(url.result.args[0].value.underline.blue);
      });
    }
  });
}

checkPages.forEach((checkPage) => {
  const {
    rules,
    domain,
  } = checkPage;

  const addresses = checkPage.addresses || [''];
  const strategy = checkPage.strategy || 'mobile';

  addresses.forEach((address) => {
    psi(domain + address, { strategy }).then((result) => {
      console.log('\n***************************'.white);
      console.log('Result of '.bgWhite.black + `${domain + address}`.bgWhite.underline.blue);
      console.log(''); // Log a new line in console

      const { SPEED, USABILITY } = result.ruleGroups;

      if (SPEED) {
        const score = (SPEED.score > 80) ? `${SPEED.score}`.green : `${SPEED.score}`.red;
        console.log('SPEED: '.white + score);
      }

      if (USABILITY) {
        console.log(`USABILITY: ${USABILITY.score}`.white);
      }

      console.log(''); // Log a new line in console

      for (let i = 0, ruleLen = rules.length; i < ruleLen; i++) {
        const ruleMsg = rules[i];
        const ruleName = psiNames[ruleMsg];

        if (!ruleName) {
          console.log(
            `Didn't find rule of ${ruleMsg}, please add it to name mapping.`.red
          );
          return;
        }

        const ruleResult = result.formattedResults.ruleResults[ruleName];

        const {
          summary,
          urlBlocks
        } = ruleResult;

        console.log(ruleMsg.yellow);
        if (summary) {
          console.log(removeCurlyBrace(summary.format).green);
        }

        if (Array.isArray(urlBlocks)) {
          printUrlBlocks(urlBlocks);
        }

        if (i !== ruleLen - 1) {
          console.log(''); // Log a new line in console
        }
      }

      console.log('***************************\n'.white);
    });
  });
});

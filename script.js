const form = document.querySelector(".form");
const code = document.querySelector(".code");

const instructionsList = [
  "ADD",
  "SUB",
  "INC",
  "DEC",
  "NOR",
  "AND",
  "XOR",
  "LDV",
  "LDR",
  "STR",
  "BRZ",
  "NOP",
];

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const instructions = code.value
    .toUpperCase()
    .replace(/ /g, "")
    .split(";")
    .join("\n")
    .split("\n")
    .filter((x) => x.length);

  let errors;
  let machineInstructions = [];
  // Análise dos mnemônicos
  errors = instructions.reduce((acc, curr, index) => {
    const instruction = curr.substring(0, 3);
    if (!instructionsList.includes(instruction)) {
      return [
        ...acc,
        {
          line: index + 1,
          msg: `use of undeclared identifier '${instruction}'`,
        },
      ];
    } else return acc;
  }, []);

  // Análise operandos
  if (errors.length === 0) {
    errors = instructions.reduce((acc, instruction, index) => {
      let mnemonic = instruction.substring(0, 3);
      let operand = instruction.replace(mnemonic, "");
      operand = operand.replace("R", "");
      if (operand.length !== 2 && operand.length !== 1 && mnemonic !== "NOP") {
        return [
          ...acc,
          {
            line: index + 1,
            msg: `for instruction ${mnemonic} the size of operand '${operand}' is too ${
              operand.length > 2 ? "large" : "small"
            }`,
          },
        ];
      } else {
        let tempOperand = operand.padStart(2, 0);
        tempOperand =
          mnemonic !== "LDV"
            ? 10 * parseInt(tempOperand[0], 16) + parseInt(tempOperand[1], 16)
            : parseInt(tempOperand, 16);
        if (mnemonic === "NOP") {
          tempOperand = 0;
        }
        if (tempOperand > 16 && mnemonic !== "LDV") {
          return [
            ...acc,
            {
              line: index + 1,
              msg: `${operand} is not a valid address.`,
            },
          ];
        }
        operand = tempOperand;

        const a = (instructionsList.indexOf(mnemonic) + 1).toString(16);

        const b =
          mnemonic === "LDV"
            ? operand.toString(16).padStart(2, 0)
            : operand.toString().padStart(2, 0);
        machineInstructions = [...machineInstructions, `${a}${b}`];
        return acc;
      }
    }, []);
  }

  errors.forEach((error) => {
    console.log(`main.taff:${error.line}: error: ${error.msg}`);
  });
  if (errors.length > 0)
    console.log(`${errors.length} errors generated.\nexit status 1`);
  else {
    const finalCode = machineInstructions.map((x) => "0x" + x);
    console.log(finalCode.join("\n"));
  }
});

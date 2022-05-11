import express, { Express, Request, Response } from 'express';
import { parse, ParserError } from '@solidity-parser/parser';
import { ASTNode } from '@solidity-parser/parser/dist/src/ast-types';
import bodyParser from 'body-parser';

const app: Express = express();
const port = 3001;

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get('/', (req: Request, res: Response) => {
  res.send(
    'Server running, Make a post req to /analyze with `code` in post params'
  );
});

app.post('/analyze', urlencodedParser, (req: Request, res: Response) => {
  try {
    const ast = parse(req.body.code);
    if (ast.type !== 'SourceUnit') {
      throw new Error('Invalid Source');
    }
    const imports: Array<string> = [];
    const contracts: Array<string> = [];
    ast.children.forEach((item: ASTNode) => {
      switch (item.type) {
        default:
          break;
        case 'ImportDirective':
          imports.push(item.path);
          break;
        case 'ContractDefinition':
          contracts.push(item.name);
          break;
      }
    });
    res.json({
      imports,
      contracts,
    });
  } catch (e) {
    if (e instanceof ParserError) {
      return res.status(500).json({
        msg: 'Unable to parse solidity code',
        errors: e.errors,
      });
    }
    res.status(500).json({
      msg: 'Something Went wrong',
    });
  }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

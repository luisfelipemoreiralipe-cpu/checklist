import { Request, Response } from 'express';
import { ExecutionService } from '../services/execution.service';

export class ExecutionController {
  private readonly service: ExecutionService;

  constructor() {
    this.service = new ExecutionService();
  }

  // POST /executions/start
  start = async (req: Request, res: Response): Promise<void> => {
    const { tenantId, sub: userId } = req.user;
    const data = await this.service.startExecution(tenantId, userId, req.body);

    res.status(201).json({ message: 'Execução iniciada', data });
  };

  // POST /executions/:id/answer
  answer = async (req: Request, res: Response): Promise<void> => {
    const { tenantId, sub: userId } = req.user;
    const data = await this.service.answerItem(
      req.params['id'] as string,
      tenantId,
      userId,
      req.body,
    );

    res.status(200).json({ message: 'Resposta registrada', data });
  };

  // POST /executions/:id/finish
  finish = async (req: Request, res: Response): Promise<void> => {
    const { tenantId, sub: userId } = req.user;
    const data = await this.service.finishExecution(
      req.params['id'] as string,
      tenantId,
      userId,
      req.body,
    );

    res.status(200).json({ message: 'Execução finalizada', data });
  };

  // GET /executions
  list = async (req: Request, res: Response): Promise<void> => {
    const { tenantId, sub: userId, role } = req.user;
    const result = await this.service.listExecutions(tenantId, userId, role, req.query as any);

    res.status(200).json(result);
  };

  // GET /executions/:id
  getById = async (req: Request, res: Response): Promise<void> => {
    const { tenantId, sub: userId, role } = req.user;
    const data = await this.service.getExecutionDetails(
      req.params['id'] as string,
      tenantId,
      userId,
      role,
    );

    res.status(200).json({ data });
  };
}

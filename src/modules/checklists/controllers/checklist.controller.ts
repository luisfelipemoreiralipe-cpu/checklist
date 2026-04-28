import { Request, Response } from 'express';
import { ChecklistService } from '../services/checklist.service';

export class ChecklistController {
  private readonly service: ChecklistService;

  constructor() {
    this.service = new ChecklistService();
  }

  // GET /checklists
  list = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.user.tenantId;
    const result = await this.service.listChecklists(tenantId, req.query as any);

    res.status(200).json(result);
  };

  // GET /checklists/:id
  getById = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.user.tenantId;
    const data = await this.service.getChecklistById(req.params['id'] as string, tenantId);

    res.status(200).json({ data });
  };

  // POST /checklists
  create = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.user.tenantId;
    const data = await this.service.createChecklist(tenantId, req.body);

    res.status(201).json({ message: 'Checklist criado', data });
  };

  // PUT /checklists/:id
  update = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.user.tenantId;
    const data = await this.service.updateChecklist(req.params['id'] as string, tenantId, req.body);

    res.status(200).json({ message: 'Checklist atualizado', data });
  };

  // DELETE /checklists/:id
  remove = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.user.tenantId;
    await this.service.deleteChecklist(req.params['id'] as string, tenantId);

    res.status(200).json({ message: 'Checklist desativado com sucesso' });
  };

  // POST /checklists/:id/items
  addItem = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.user.tenantId;
    const data = await this.service.addItem(req.params['id'] as string, tenantId, req.body);

    res.status(201).json({ message: 'Item adicionado', data });
  };

  // PUT /items/:id
  updateItem = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.user.tenantId;
    const data = await this.service.updateItem(req.params['id'] as string, tenantId, req.body);

    res.status(200).json({ message: 'Item atualizado', data });
  };

  // DELETE /items/:id
  deleteItem = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.user.tenantId;
    await this.service.deleteItem(req.params['id'] as string, tenantId);

    res.status(200).json({ message: 'Item removido com sucesso' });
  };

  // POST /items/:id/rules
  addRule = async (req: Request, res: Response): Promise<void> => {
    const tenantId = req.user.tenantId;
    const data = await this.service.addRule(req.params['id'] as string, tenantId, req.body);

    res.status(201).json({ message: 'Regra adicionada', data });
  };
}

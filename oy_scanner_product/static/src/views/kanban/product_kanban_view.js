/** @odoo-module **/

import { registry } from "@web/core/registry";
import { kanbanView } from "@web/views/kanban/kanban_view";
import { ProductKanbanController} from "./product_kanban_controller";


export const productKanbanView = {
    ...kanbanView,
    Controller: ProductKanbanController,
    buttonTemplate: "KanbanView.Buttons",
};
registry.category("views").add("product_template_kanban_view", productKanbanView);

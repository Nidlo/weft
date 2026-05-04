"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import {
  useAddMaterial,
  useTogglePurchased,
  useRemoveMaterial,
  useOrderProfitSummary,
} from "@/lib/hooks/use-orders";
import { formatPesewas } from "@/lib/utils/order";
import type { GqlOrderMaterial } from "@/types/graphql";

interface CostBookPanelProps {
  orderId: string;
  materials: GqlOrderMaterial[];
  onMaterialChange?: () => void;
}

export function CostBookPanel({
  orderId,
  materials,
  onMaterialChange,
}: CostBookPanelProps) {
  const [name, setName] = useState("");
  const [unitCostGhs, setUnitCostGhs] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [showForm, setShowForm] = useState(false);

  const { addMaterial, loading: adding } = useAddMaterial();
  const { togglePurchased } = useTogglePurchased();
  const { removeMaterial } = useRemoveMaterial();
  const { summary } = useOrderProfitSummary(orderId);

  const handleAdd = async () => {
    if (!name || !unitCostGhs) return;
    await addMaterial({
      orderId,
      name,
      unitCost: Math.round(parseFloat(unitCostGhs) * 100),
      quantity: parseInt(quantity) || 1,
    });
    setName("");
    setUnitCostGhs("");
    setQuantity("1");
    setShowForm(false);
    onMaterialChange?.();
  };

  const handleToggle = async (materialId: string) => {
    await togglePurchased(materialId);
    onMaterialChange?.();
  };

  const handleRemove = async (materialId: string) => {
    await removeMaterial(materialId);
    onMaterialChange?.();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Cost Book</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Material
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add form */}
        {showForm && (
          <div className="space-y-3 rounded-lg border p-3">
            <div>
              <Label htmlFor="material-name">Material</Label>
              <Input
                id="material-name"
                placeholder="e.g. Ankara Fabric"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="material-cost">Unit Cost (GHS)</Label>
                <Input
                  id="material-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="80.00"
                  value={unitCostGhs}
                  onChange={(e) => setUnitCostGhs(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="material-qty">Qty</Label>
                <Input
                  id="material-qty"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </div>
            <Button size="sm" onClick={handleAdd} disabled={adding || !name || !unitCostGhs}>
              {adding ? "Adding..." : "Add"}
            </Button>
          </div>
        )}

        {/* Materials list */}
        {materials.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted-foreground">
            No materials added yet.
          </p>
        ) : (
          <div className="space-y-2">
            {materials.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <Switch
                  checked={m.isPurchased}
                  onCheckedChange={() => handleToggle(m.id)}
                  aria-label={`Mark ${m.name} as purchased`}
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${m.isPurchased ? "line-through text-muted-foreground" : ""}`}>
                    {m.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatPesewas(m.unitCost)} x {m.quantity} = {formatPesewas(m.totalCost)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${m.name}`}
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(m.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Profit summary */}
        {summary && summary.confirmedPrice > 0 && (
          <>
            <Separator />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Materials</span>
                <span>{formatPesewas(summary.totalMaterialCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Price</span>
                <span>{formatPesewas(summary.confirmedPrice)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Profit</span>
                <span className={summary.profit >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatPesewas(summary.profit)} ({summary.marginPercent}%)
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.purchasedCount}/{summary.materialCount} materials purchased
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

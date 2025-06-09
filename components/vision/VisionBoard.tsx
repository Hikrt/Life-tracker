
import React, { useState } from 'react';
import { Objective, KeyResult } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { ProgressBar } from '../ui/ProgressBar';
import { PlusCircleIcon, PencilIcon, TrashIcon, TargetIcon } from '../../constants';

interface VisionBoardProps {
  objectives: Objective[];
  currentQuarter: string;
  setCurrentQuarter: (quarter: string) => void;
  onAddObjective: (objective: Objective) => void;
  onUpdateObjective: (objective: Objective) => void;
  onDeleteObjective: (objectiveId: string) => void;
  onUpdateKeyResultProgress: (krId: string, valueToAdd: number, absoluteValue?: number) => void;
}

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const VisionBoard: React.FC<VisionBoardProps> = ({
  objectives,
  currentQuarter,
  setCurrentQuarter,
  onAddObjective,
  onUpdateObjective,
  onDeleteObjective,
  onUpdateKeyResultProgress,
}) => {
  const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
  const [isKRModalOpen, setIsKRModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [editingKR, setEditingKR] = useState<KeyResult | null>(null);
  const [currentObjectiveForKR, setCurrentObjectiveForKR] = useState<string | null>(null);

  const [objectiveTitle, setObjectiveTitle] = useState('');
  const [krDescription, setKrDescription] = useState('');
  const [krTarget, setKrTarget] = useState('');
  const [krCurrent, setKrCurrent] = useState('0');
  const [krUnit, setKrUnit] = useState('');
  
  const [manualProgressKrId, setManualProgressKrId] = useState<string | null>(null);
  const [manualProgressValue, setManualProgressValue] = useState<string>('');


  const quarters = Array.from({ length: 8 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i * 3 - 3); // Go back one quarter, then generate forward
    const q = Math.floor(date.getMonth() / 3) + 1;
    return `Q${q} ${date.getFullYear()}`;
  });

  const handleOpenObjectiveModal = (obj?: Objective) => {
    setEditingObjective(obj || null);
    setObjectiveTitle(obj ? obj.title : '');
    setIsObjectiveModalOpen(true);
  };

  const handleSaveObjective = () => {
    if (!objectiveTitle.trim()) return;
    if (editingObjective) {
      onUpdateObjective({ ...editingObjective, title: objectiveTitle });
    } else {
      onAddObjective({
        id: generateId(),
        title: objectiveTitle,
        quarter: currentQuarter,
        keyResults: [],
      });
    }
    setObjectiveTitle('');
    setIsObjectiveModalOpen(false);
    setEditingObjective(null);
  };

  const handleOpenKRModal = (objId: string, kr?: KeyResult) => {
    setCurrentObjectiveForKR(objId);
    setEditingKR(kr || null);
    setKrDescription(kr ? kr.description : '');
    setKrTarget(kr ? kr.targetValue.toString() : '');
    setKrCurrent(kr ? kr.currentValue.toString() : '0');
    setKrUnit(kr ? kr.unit : '');
    setIsKRModalOpen(true);
  };

  const handleSaveKR = () => {
    if (!krDescription.trim() || !krTarget.trim() || !krUnit.trim() || !currentObjectiveForKR) return;
    const targetVal = parseFloat(krTarget);
    const currentVal = parseFloat(krCurrent);
    if (isNaN(targetVal) || isNaN(currentVal)) return;

    const objectiveToUpdate = objectives.find(obj => obj.id === currentObjectiveForKR);
    if (!objectiveToUpdate) return;

    let updatedKRs: KeyResult[];
    if (editingKR) {
      updatedKRs = objectiveToUpdate.keyResults.map(kr =>
        kr.id === editingKR.id
          ? { ...kr, description: krDescription, targetValue: targetVal, currentValue: currentVal, unit: krUnit }
          : kr
      );
    } else {
      const newKR: KeyResult = {
        id: generateId(),
        description: krDescription,
        targetValue: targetVal,
        currentValue: currentVal,
        unit: krUnit,
        objectiveId: currentObjectiveForKR,
      };
      updatedKRs = [...objectiveToUpdate.keyResults, newKR];
    }
    onUpdateObjective({ ...objectiveToUpdate, keyResults: updatedKRs });
    
    setKrDescription('');
    setKrTarget('');
    setKrCurrent('0');
    setKrUnit('');
    setIsKRModalOpen(false);
    setEditingKR(null);
    setCurrentObjectiveForKR(null);
  };

  const handleDeleteKR = (objId: string, krId: string) => {
    if (!window.confirm("Are you sure you want to delete this Key Result?")) return;
    const objectiveToUpdate = objectives.find(obj => obj.id === objId);
    if (objectiveToUpdate) {
      const updatedKRs = objectiveToUpdate.keyResults.filter(kr => kr.id !== krId);
      onUpdateObjective({ ...objectiveToUpdate, keyResults: updatedKRs });
    }
  };
  
  const handleManualProgressSave = (krId: string) => {
    const value = parseFloat(manualProgressValue);
    if (!isNaN(value)) {
      onUpdateKeyResultProgress(krId, 0, value); // Use absoluteValue override
    }
    setManualProgressKrId(null);
    setManualProgressValue('');
  };


  const objectivesForCurrentQuarter = objectives.filter(obj => obj.quarter === currentQuarter);

  return (
    <div className="space-y-6">
      <Card title="Quarterly Vision & OKRs" titleIcon={<TargetIcon className="high-contrast:text-hc-primary"/>}>
        <div className="mb-4 flex items-center space-x-3">
          <label htmlFor="quarterSelect" className="font-medium high-contrast:text-hc-text">Select Quarter:</label>
          <select
            id="quarterSelect"
            value={currentQuarter}
            onChange={(e) => setCurrentQuarter(e.target.value)}
            className="p-2 border rounded-md bg-light-card dark:bg-dark-card dark:border-gray-600 high-contrast:bg-hc-bg high-contrast:text-hc-text high-contrast:border-hc-border"
          >
            {quarters.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>
        <Button onClick={() => handleOpenObjectiveModal()} leftIcon={<PlusCircleIcon />} className="mb-4">
          Add Objective for {currentQuarter}
        </Button>

        {objectivesForCurrentQuarter.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4 high-contrast:text-gray-300">
            No objectives defined for {currentQuarter}. Add one to get started!
          </p>
        )}

        {objectivesForCurrentQuarter.map(obj => (
          <Card key={obj.id} title={obj.title} className="mb-4 bg-primary/5 dark:bg-dark-bg high-contrast:bg-hc-bg high-contrast:border-hc-border"
            actions={
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleOpenObjectiveModal(obj)} aria-label="Edit Objective">
                  <PencilIcon className="w-4 h-4" />
                </Button>
                <Button variant="danger" size="sm" onClick={() => {
                    if (window.confirm("Are you sure you want to delete this objective and all its key results?")) {
                        onDeleteObjective(obj.id);
                    }
                }} aria-label="Delete Objective">
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            }
          >
            <div className="space-y-3">
              {obj.keyResults.map(kr => (
                <div key={kr.id} className="p-3 border-l-4 border-accent dark:border-yellow-400 bg-light-bg dark:bg-gray-800 rounded-r-md high-contrast:border-hc-accent high-contrast:bg-hc-bg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-light-text dark:text-dark-text high-contrast:text-hc-text">{kr.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 high-contrast:text-gray-300">
                        Target: {kr.targetValue.toLocaleString()} {kr.unit}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                       <Button variant="ghost" size="sm" onClick={() => handleOpenKRModal(obj.id, kr)} aria-label="Edit Key Result" className="p-1">
                         <PencilIcon className="w-3 h-3" />
                       </Button>
                       <Button variant="danger" size="sm" onClick={() => handleDeleteKR(obj.id, kr.id)} aria-label="Delete Key Result" className="p-1">
                         <TrashIcon className="w-3 h-3" />
                       </Button>
                    </div>
                  </div>
                  <ProgressBar value={(kr.currentValue / kr.targetValue) * 100} showPercentage color="accent" height="h-2" />
                  <div className="text-right text-xs mt-1">
                    {manualProgressKrId === kr.id ? (
                         <div className="flex items-center justify-end space-x-1 mt-1">
                            <Input 
                                type="number" 
                                value={manualProgressValue}
                                onChange={e => setManualProgressValue(e.target.value)}
                                placeholder={`New ${kr.unit} value`}
                                className="w-24 py-0.5 text-xs"
                            />
                            <Button size="sm" variant="secondary" onClick={() => handleManualProgressSave(kr.id)} className="text-xs py-0.5 px-1.5">Set</Button>
                            <Button size="sm" variant="ghost" onClick={() => setManualProgressKrId(null)} className="text-xs py-0.5 px-1.5">Cancel</Button>
                         </div>
                    ) : (
                        <>
                         <span className="text-gray-700 dark:text-gray-300 high-contrast:text-hc-text">{kr.currentValue.toLocaleString()} / {kr.targetValue.toLocaleString()} {kr.unit}</span>
                         <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setManualProgressKrId(kr.id); setManualProgressValue(kr.currentValue.toString());}} 
                            className="ml-1 p-0.5 text-xs underline"
                            aria-label="Manually update progress"
                         >
                            Update
                         </Button>
                        </>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => handleOpenKRModal(obj.id)} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>
                Add Key Result
              </Button>
            </div>
          </Card>
        ))}
      </Card>

      {/* Objective Modal */}
      <Modal isOpen={isObjectiveModalOpen} onClose={() => setIsObjectiveModalOpen(false)} title={editingObjective ? 'Edit Objective' : 'Add New Objective'}>
        <div className="space-y-4">
          <Input
            label="Objective Title"
            value={objectiveTitle}
            onChange={(e) => setObjectiveTitle(e.target.value)}
            placeholder="e.g., Master CFA Level 1 Quant Methods"
          />
           <p className="text-sm text-gray-600 dark:text-gray-400 high-contrast:text-gray-300">For Quarter: <span className="font-semibold">{currentQuarter}</span></p>
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setIsObjectiveModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveObjective}>{editingObjective ? 'Save Changes' : 'Add Objective'}</Button>
          </div>
        </div>
      </Modal>

      {/* Key Result Modal */}
      <Modal isOpen={isKRModalOpen} onClose={() => setIsKRModalOpen(false)} title={editingKR ? 'Edit Key Result' : 'Add New Key Result'}>
        <div className="space-y-4">
          <TextArea
            label="Key Result Description"
            value={krDescription}
            onChange={(e) => setKrDescription(e.target.value)}
            placeholder="e.g., Achieve 80% average on mock exams"
            rows={2}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Target Value"
              type="number"
              value={krTarget}
              onChange={(e) => setKrTarget(e.target.value)}
              placeholder="e.g., 80"
            />
            <Input
              label="Current Value"
              type="number"
              value={krCurrent}
              onChange={(e) => setKrCurrent(e.target.value)}
              placeholder="e.g., 0"
            />
            <Input
              label="Unit"
              value={krUnit}
              onChange={(e) => setKrUnit(e.target.value)}
              placeholder="e.g., %, hours, sessions"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setIsKRModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveKR}>{editingKR ? 'Save Changes' : 'Add Key Result'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VisionBoard;

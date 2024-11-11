'use client'

import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useEffect, useState } from 'react'
import { useModels, useFileId, usePrompts } from "@/components/context-provider"

interface Model {
  model_id: string;
  model: string;
  temperature: number;
  max_length: number;
  top_p: number;
}

interface ModelsResponse {
  models: Record<string, Model>;
}

interface File {
  file_id: string;
  file_name: string;
  uploaded_at: string;
  test_count: number;
}

interface FilesResponse {
  files: File[];
}

interface Prompt {
  prompt: string;
  created_at: string;
}

interface PromptResponse {
  prompts: Prompt[];
}

const AppSidebar: React.FC = () => {
  const [models, setModels] = useState<ModelsResponse | null>(null);
  const [fetchedFiles, setFetchedFiles] = useState<FilesResponse | null>(null);
  const { file_id, setFileId } = useFileId();
  const handleFileClick = (fileId: string) => {
    setFileId(fileId);
  };
  const [fetchedPrompts, setFetchedPrompts] = useState<PromptResponse | null>(null);
  const { prompts, setPrompts } = usePrompts();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/models")
      .then((response: Response) => response.json())
      .then((data: ModelsResponse) => setModels(data))
      .catch((error: Error) => console.error('Error fetching models:', error));
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/files")
      .then((response: Response) => response.json())
      .then((data: FilesResponse) => setFetchedFiles(data))
      .catch((error: Error) => console.error('Error fetching files:', error));
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/prompts")
      .then((response: Response) => response.json())
      .then((data: PromptResponse) => setFetchedPrompts(data))
      .catch((error: Error) => console.error('Error fetching prompts:', error));
  }, []);

  const handleRemovePrompt = (index: number) => {
    const { [index]: _, ...newPrompts } = prompts;
    setPrompts(newPrompts);
  };

  const handlePromptChange = (index: number, value: string) => {
    setPrompts({ ...prompts, [index]: value });
  };

  console.log(models, file_id, prompts);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Recent Models</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="overflow-y-auto max-h-64">
              {models && Object.entries(models.models).map(([provider, model], index) => (
                <div key={model.model_id} className="mx-3 p-2 mb-2 border rounded">
                  <Checkbox
                    id={`model-${index}`}
                    onChange={(e) => {
                      if ((e.target as HTMLInputElement).checked) {
                        useModels().setSelectedModels((prev) => ({ ...prev, [index]: model.model_id }));
                      } else {
                        useModels().setSelectedModels((prev) => {
                          const newModels = { ...prev };
                          delete newModels[index];
                          return newModels;
                        });
                      }
                    }}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={`model-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <strong>{provider}</strong>
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Model: {model.model}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Temperature: {model.temperature}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Max Length: {model.max_length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Top P: {model.top_p}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </SidebarGroupContent>
          <SidebarGroupLabel>Uploaded Test Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="overflow-y-auto max-h-54">
              <select
              className="w-full p-2 border rounded"
              onChange={(e) => handleFileClick(e.target.value)}
              value={file_id || ""}
              >
              <option value="" disabled>Select a file</option>
              {fetchedFiles && fetchedFiles.files.map((file) => (
                <option key={file.file_id} value={file.file_id}>
                {file.file_name} (Test Count: {file.test_count})
                </option>
              ))}
              </select>
            </div>
          </SidebarGroupContent>
          <SidebarGroupLabel>Recent Prompts</SidebarGroupLabel>
            <SidebarGroupContent>
            <div className="overflow-y-auto max-h-64">
              {fetchedPrompts && fetchedPrompts.prompts.map((prompt, index) => (
              <div key={index} className="mx-3 p-2 mb-2 border rounded">
                <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor={`prompt-${index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <strong>{prompt.prompt}</strong>
                </label>
                <p className="text-sm text-muted-foreground">
                  Created At: {new Date(prompt.created_at).toLocaleString()}
                </p>
                <div className="flex space-x-2">
                  <Button
                  size = "sm"
                  onClick={() => handlePromptChange(index, prompt.prompt)}
                  >
                  +
                  </Button>
                  <Button
                  size = "sm"
                  onClick={() => handleRemovePrompt(index)}
                  disabled={!prompts[index]}
                  >
                  -
                  </Button>
                </div>
                </div>
              </div>
              ))}
            </div>
            </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>

  )
}

export default AppSidebar;

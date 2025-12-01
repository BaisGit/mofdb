from pathlib import Path
from huggingface_hub import hf_hub_download

current_dir = Path.cwd()

file_path = hf_hub_download(
    repo_id="ytbai/H2MOF-ML",
    filename="H2MOF-ML.json",
    repo_type="dataset",
    local_dir=str(current_dir),
    local_dir_use_symlinks=False,
)

print("Saved at:", file_path)

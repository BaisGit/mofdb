import json
import logging
import os
from types import SimpleNamespace

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
logger.disabled = True


def dict_to_namespace(d):
    """Convert a dictionary to an object supporting dot notation"""
    if isinstance(d, dict):
        return SimpleNamespace(**{k: dict_to_namespace(v) for k, v in d.items()})
    elif isinstance(d, list):
        return [dict_to_namespace(item) for item in d]
    return d

def load_json_samples(json_file):
    """Load JSON file and return a dictionary of samples with dot notation support
    
    Args:
        json_file (str): Path to the JSON file
        
    Returns:
        dict: Dictionary with sample names as keys and SimpleNamespace objects as values
    """
    try:
        # Check if file exists
        if not os.path.exists(json_file):
            logger.error(f"JSON file not found: {json_file}")
            raise FileNotFoundError(f"JSON file not found: {json_file}")
        
        # Load JSON data
        with open(json_file, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
        
        logger.info(f"Loaded JSON file: {json_file}")
        logger.info(f"Number of samples: {len(json_data)}")
        
        # Convert to dictionary with SimpleNamespace objects
        samples = {}
        for sample_name, sample_data in json_data.items():
            # Convert the entire sample data to SimpleNamespace
            samples[sample_name] = dict_to_namespace(sample_data)
            logger.debug(f"Loaded sample: {sample_name}")
        
        return samples
    
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON format in {json_file}: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error while loading {json_file}: {str(e)}")
        raise



# load JSON file
json_file = "H2MOF-ML.json"
samples = load_json_samples(json_file)
sample_name = "ABEXOW"
print(samples[sample_name].lattice.abc)
print(samples[sample_name].properties.metal_composition.total_metal_atoms)
print(samples[sample_name].properties.UV_at_TPS)

# example output
# [12.002, 11.008, 19.473]
# 7
# 23.96
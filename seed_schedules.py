import pandas as pd
from datetime import datetime, timedelta
import json
import re

file_path = r'C:\Users\fatha\Downloads\Jadwal Pelajaran 2026-2027_fix (1).xlsx'

# Ensure these match the availableClasses exactly
valid_classes = [
    "I. Siti Walidah", "I. Ahmad Dahlan", "I. IR Soekarno", 
    "II. AR. Fachruddin", "II. Haedar Nasier", 
    "III. Syafi'l Maarif", "III. Buya Hamka", 
    "IV. Jendral Sudirman", "IV. Siti Munjiah", 
    "V. KH. Mas Mansyur", "V. Siti Bariah", 
    "VI. Din Syamsuddin", "VI. Amien Rais"
]

def map_class_name(raw_name):
    # Regex to extract "KELAS [ROMAWI] [NAME]"
    match = re.search(r'KELAS\s+([IVX]+)\s+(.*)', str(raw_name).upper())
    if not match:
        return None
    
    romawi = match.group(1).strip()
    name = match.group(2).strip()
    
    # Direct mappings if fuzzy fails
    mapping = {
        'I AHMAD DAHLAN': 'I. Ahmad Dahlan',
        'I IR. SOEKARNO': 'I. IR Soekarno',
        'I SITI WALIDAH': 'I. Siti Walidah',
        'II AR. FACHRUDDIN': 'II. AR. Fachruddin',
        'II HAEDAR NASHIR': 'II. Haedar Nasier',
        'II HAEDAR NASIER': 'II. Haedar Nasier',
        'II SITI MUNJIAH': 'IV. Siti Munjiah',
        "III SYAFI'I MAARIF": "III. Syafi'l Maarif",
        "III BUYA HAMKA": 'III. Buya Hamka',
        'IV JENDRAL SUDIRMAN': 'IV. Jendral Sudirman',
        'IV SITI MUNJIAH': 'IV. Siti Munjiah',
        'V KH. MAS MANSYUR': 'V. KH. Mas Mansyur',
        'V SITI BARIAH': 'V. Siti Bariah',
        'VI DIN SYAMSUDDIN': 'VI. Din Syamsuddin',
        'VI AMIEN RAIS': 'VI. Amien Rais'
    }
    
    clean_search = f"{romawi} {name}".replace("'", "").replace(".", "")
    for k, v in mapping.items():
        if clean_search == k.replace("'", "").replace(".", ""):
            return v
            
    return None

def parse_sheet(sheet_name):
    df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
    
    classes_data = {}
    current_class = None
    schedule_rows = []
    parsing_schedule = False
    
    for index, row in df.iterrows():
        cell_0 = str(row[0]).strip()
        
        if cell_0.startswith("JADWAL PELAJARAN KELAS"):
            current_class = map_class_name(cell_0)
            print(f"Found class: {cell_0} -> Mapped to: {current_class}")
            parsing_schedule = False
            schedule_rows = []
            
        elif current_class and cell_0 == "Jam Ke":
            parsing_schedule = True
            
        elif parsing_schedule and current_class:
            if pd.isna(row[0]) and pd.isna(row[1]) and pd.isna(row[2]):
                if schedule_rows: # End of block
                    classes_data[current_class] = schedule_rows
                    parsing_schedule = False
                continue
                
            if str(row[2]).strip() == "I  S  T  I  R  A  H  A  T" or str(row[2]).strip() == "I  S  H  O  M  A":
                schedule_rows.append({
                    "jam": "-",
                    "waktu": str(row[1]).strip(),
                    "Senin": "ISTIRAHAT",
                    "Selasa": "ISTIRAHAT",
                    "Rabu": "ISTIRAHAT",
                    "Kamis": "ISTIRAHAT",
                    "Jum'at": "ISTIRAHAT",
                })
            elif not pd.isna(row[1]):
                schedule_rows.append({
                    "jam": str(row[0]).strip() if not pd.isna(row[0]) else "-",
                    "waktu": str(row[1]).strip(),
                    "Senin": str(row[2]).strip() if not pd.isna(row[2]) else "-",
                    "Selasa": str(row[3]).strip() if not pd.isna(row[3]) else "-",
                    "Rabu": str(row[4]).strip() if not pd.isna(row[4]) else "-",
                    "Kamis": str(row[5]).strip() if not pd.isna(row[5]) else "-",
                    "Jum'at": str(row[6]).strip() if not pd.isna(row[6]) else "-",
                })
                
    # Add the last class if not added
    if current_class and parsing_schedule and schedule_rows:
        classes_data[current_class] = schedule_rows
        
    return classes_data

all_classes_data = {}
all_classes_data.update(parse_sheet('kelas kecil'))
all_classes_data.update(parse_sheet('kelas besar'))

# Now generate daily schedules
# Dates from 2026-07-13 to 2027-06-30
start_date = datetime(2026, 7, 13)
end_date = datetime(2027, 6, 30)

day_map = {
    0: 'Senin',
    1: 'Selasa',
    2: 'Rabu',
    3: 'Kamis',
    4: "Jum'at"
}

records = []

curr_date = start_date
while curr_date <= end_date:
    weekday = curr_date.weekday()
    if weekday < 5: # Monday to Friday
        day_str = day_map[weekday]
        date_str = curr_date.strftime("%Y-%m-%d")
        
        for class_name, schedule_rows in all_classes_data.items():
            
            # Format the schedule text
            schedule_text = ""
            for r in schedule_rows:
                subject = r.get(day_str, "-")
                if subject == "-" or subject == "nan" or pd.isna(subject):
                    continue
                schedule_text += f"{r['waktu']} : {subject}\n"
                
            schedule_text = schedule_text.strip()
            
            uniform = ""
            if day_str == "Senin" or day_str == "Selasa":
                uniform = "Seragam Merah Putih"
            elif day_str == "Rabu" or day_str == "Kamis":
                uniform = "Seragam Hizbul Wathan (HW)"
            elif day_str == "Jum'at":
                uniform = "Seragam Olahraga / Bebas Rapi"
            
            if class_name:
                records.append({
                    "class_name": class_name,
                    "target_date": date_str,
                    "schedule": schedule_text if schedule_text else "Tidak ada jadwal",
                    "homework": "-",
                    "uniform": uniform,
                    "highlights": "Pembiasaan Pagi : Sholat Dhuha, Tilawah Dan Literasi"
                })
            
    curr_date += timedelta(days=1)

with open('seed_data.json', 'w') as f:
    json.dump(records, f, indent=2)

print(f"Generated {len(records)} daily schedule records.")

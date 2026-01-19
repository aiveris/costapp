import { Transaction, TransactionType, ExpenseCategory } from '../types';
import { parse } from 'date-fns';

/**
 * Parsina CSV eilutę, atsižvelgdamas į kabutes ir kablelius
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  result.push(current.trim());
  
  return result;
}

/**
 * Konvertuoja CSV eilutę į Transaction objektą
 */
function parseCSVRow(row: string[], headers: string[]): Transaction | null {
  try {
    // Rasti stulpelių indeksus
    const dateIndex = headers.findIndex(h => h.toLowerCase().includes('data'));
    const typeIndex = headers.findIndex(h => h.toLowerCase().includes('tipas'));
    const amountIndex = headers.findIndex(h => h.toLowerCase().includes('suma'));
    const categoryIndex = headers.findIndex(h => h.toLowerCase().includes('kategorija'));
    const descriptionIndex = headers.findIndex(h => h.toLowerCase().includes('aprašymas') || h.toLowerCase().includes('aprasymas'));

    if (dateIndex === -1 || typeIndex === -1 || amountIndex === -1) {
      return null;
    }

    // Parsinti datą
    const dateStr = row[dateIndex]?.replace(/"/g, '') || '';
    let date: Date;
    try {
      // Bandyti parse yyyy-MM-dd formatą
      date = parse(dateStr, 'yyyy-MM-dd', new Date());
      if (isNaN(date.getTime())) {
        // Bandyti kitus formatus
        date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          console.warn(`Nepavyko parsinti datos: ${dateStr}`);
          return null;
        }
      }
    } catch (error) {
      console.warn(`Klaida parsintant datą: ${dateStr}`, error);
      return null;
    }

    // Parsinti tipą
    const typeStr = row[typeIndex]?.replace(/"/g, '').toLowerCase() || '';
    let type: TransactionType;
    if (typeStr.includes('pajamos') || typeStr === 'income') {
      type = 'income';
    } else if (typeStr.includes('išlaidos') || typeStr.includes('islaidos') || typeStr === 'expense') {
      type = 'expense';
    } else {
      console.warn(`Nežinomas tipas: ${typeStr}`);
      return null;
    }

    // Parsinti sumą
    const amountStr = row[amountIndex]?.replace(/"/g, '').replace(/€/g, '').replace(/,/g, '.').trim() || '';
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      console.warn(`Neteisinga suma: ${amountStr}`);
      return null;
    }

    // Parsinti kategoriją (nebūtina)
    let category: ExpenseCategory | undefined;
    if (categoryIndex !== -1 && row[categoryIndex]) {
      const categoryStr = row[categoryIndex].replace(/"/g, '').trim().toLowerCase();
      const validCategories: ExpenseCategory[] = [
        'būstas', 'mokesčiai', 'maistas', 'drabužiai', 'automobilis',
        'pramogos', 'sveikata', 'grožis', 'vaikas', 'kitos'
      ];
      
      // Rasti atitinkamą kategoriją (su ar be diakritikos)
      const foundCategory = validCategories.find(cat => {
        const catLower = cat.toLowerCase();
        return catLower === categoryStr || 
               catLower.replace(/ū/g, 'u').replace(/č/g, 'c').replace(/š/g, 's') === 
               categoryStr.replace(/ū/g, 'u').replace(/č/g, 'c').replace(/š/g, 's');
      });
      
      if (foundCategory) {
        category = foundCategory;
      }
    }

    // Parsinti aprašymą
    const description = descriptionIndex !== -1 ? (row[descriptionIndex]?.replace(/"/g, '') || '') : '';

    // Sukurti Transaction objektą (be id, jis bus sukurtas Firestore)
    return {
      id: '', // Bus priskirtas Firestore
      type,
      amount,
      date,
      description,
      category: type === 'expense' ? category : undefined,
      currency: 'EUR',
    } as Transaction;
  } catch (error) {
    console.error('Klaida parsintant CSV eilutę:', error, row);
    return null;
  }
}

/**
 * Importuoja transakcijas iš CSV failo
 */
export const importTransactionsFromCSV = (file: File): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          reject(new Error('Failas tuščias'));
          return;
        }

        // Pašalinti BOM, jei yra
        const content = text.replace(/^\uFEFF/, '');
        
        // Padalinti į eilutes
        const lines = content.split(/\r?\n/).filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('CSV failas turi turėti bent antraštę ir vieną duomenų eilutę'));
          return;
        }

        // Parsinti antraštę
        const headers = parseCSVLine(lines[0]);
        
        // Parsinti duomenų eilutes
        const transactions: Transaction[] = [];
        let successCount = 0;
        let errorCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const row = parseCSVLine(lines[i]);
          if (row.length === 0 || row.every(cell => !cell.trim())) {
            continue; // Praleisti tuščias eilutes
          }

          const transaction = parseCSVRow(row, headers);
          if (transaction) {
            transactions.push(transaction);
            successCount++;
          } else {
            errorCount++;
          }
        }

        if (transactions.length === 0) {
          reject(new Error('Nepavyko parsinti jokių transakcijų iš CSV failo'));
          return;
        }

        console.log(`Sėkmingai parsinta ${successCount} transakcijų${errorCount > 0 ? `, ${errorCount} klaidų` : ''}`);
        resolve(transactions);
      } catch (error: any) {
        reject(new Error(`Klaida parsintant CSV failą: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Nepavyko nuskaityti failo'));
    };

    reader.readAsText(file, 'UTF-8');
  });
};

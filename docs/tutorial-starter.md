Syntax and Basic Fields :
In prolog, We declare some facts. These facts constitute the Knowledge Base of the system. We can query against the Knowledge Base. We get output as affirmative if our query is already in the knowledge Base or it is implied by Knowledge Base, otherwise we get output as negative. So, Knowledge Base can be considered similar to database, against which we can query. Prolog facts are expressed in definite pattern. Facts contain entities and their relation. Entities are written within the parenthesis separated by comma (, ). Their relation is expressed at the start and outside the parenthesis. Every fact/rule ends with a dot (.). So, a typical prolog fact goes as follows :

Format : relation(entity1, entity2, ....k'th entity).

Example :
friends(raju, mahesh).
singer(sonu).
odd_number(5).

Explanation :
These facts can be interpreted as :
raju and mahesh are friends.
sonu is a singer.
5 is an odd number.

Key Features : 1. Unification : The basic idea is, can the given terms be made to represent the same structure. 2. Backtracking : When a task fails, prolog traces backwards and tries to satisfy previous task. 3. Recursion : Recursion is the basis for any search in program.

Running queries : A typical prolog query can be asked as :

Query 1 : ?- singer(sonu).
Output : Yes.

Explanation : As our knowledge base contains 
the above fact, so output was 'Yes', otherwise 
it would have been 'No'. 

Query 2 : ?- odd_number(7).
Output : No.

Explanation : As our knowledge base does not 
contain the above fact, so output was 'No'.
